import { useState, useRef, useEffect } from "react";
import { useMobile, useKeyboardVisible } from "./useMobile.js";
import { useChatHistory } from "./hooks/useChatHistory.js";
import { useSessionTracker } from "./hooks/useSessionTracker.js";
import { useThriftyMode } from "./hooks/useThriftyMode.js";
import { useDomainHint } from "./hooks/useDomainHint.js";
import { buildRouterDecision, estimateTokens, detectDomain, getRouterCosts } from "./lib/nightShiftRouter.js";
import { computeMsgCost, formatCostDisplay, estimateInputTokens, nextMessageId } from "./lib/contracts.js";
import PhilosophyModal from "./components/PhilosophyModal.jsx";
import SessionSummary from "./components/SessionSummary.jsx";
import RouterBadge from "./components/RouterBadge.jsx";
import RouterPanel from "./components/RouterPanel.jsx";
import { parseEvidenceTiers } from "./components/EvidenceCard.jsx";
import "./rei.css";

const FINGERPRINT_COSTS = getRouterCosts();
const DEFAULT_COST_MODEL = "llama-3.3-70b-versatile";
const MODEL_COST_PER_1K = {
  ...Object.fromEntries(
    Object.entries(FINGERPRINT_COSTS).map(([model, costs]) => [
      model,
      (costs.costPer1kInput + costs.costPer1kOutput) / 2,
    ])
  ),
  mock: 0,
  "rate-limited": 0,
};

const MAX_RECORD_CHARS = 12000;

const SOURCE_TYPES = [
  { id: "ancestry", label: "Ancestry transcript" },
  { id: "familysearch", label: "FamilySearch record" },
  { id: "findagrave", label: "Find A Grave memorial" },
  { id: "other", label: "Other / unspecified" },
];

const DOMAIN_PROFILES = [
  {
    id: "assistant",
    label: "The Generalist",
    badge: "Active",
    description: "Everyday reasoning, judgment, and decision support.",
    rules: ["Short sentences", "Hinge first", "Facts with sources", "Flag uncertainty"],
    exemplar: "Turning loose thoughts into a clean, usable decision path."
  },
  {
    id: "coding",
    label: "The Hinge Finder",
    badge: "Active",
    description: "Senior coding logic executing CARDO REI methodology.",
    rules: ["Verify API shapes", "Name hinges explicitly", "Stop and ask if underspecified"],
    exemplar: "Decomposing complex requirements into small, testable coding iterations."
  },
  {
    id: "genealogy",
    label: "The Archivist",
    badge: "Active",
    description: "Evidence-tiered genealogy and disambiguating same-name profiles.",
    rules: ["Compare parent-child age limits", "Assign evidence tiers", "Log negative search results"],
    exemplar: "Thomas Ramsey same-name disambiguation and parish register evaluation."
  },
  {
    id: "story",
    label: "The Storyteller",
    badge: "Active",
    description: "Narrative architecture generating story blueprints.",
    rules: ["Establish blueprint structure", "Identify character driver hinges", "Avoid cliché tropes"],
    exemplar: "Expanding historical inspiration seeds into multi-part character outlines."
  }
];

function getAssistantWelcomeCopy() {
  return [
    "REI is live.",
    "Dual-engine active: Latin [Rei: The Matter / Reality / Hinge] and Operational [Record, Evaluate, Iterate].",
    "Bring me the thing you're trying to think through, and we'll pull it apart."
  ].join(" ");
}

function isSimpleGreeting(text = "") {
  return /^(hi|hello|hey|yo|hiya|good (morning|afternoon|evening))[\s!.?]*$/i.test(text.trim());
}

function buildAssistantStyleReply(userText) {
  const clean = userText.trim().replace(/\s+/g, " ");
  if (isSimpleGreeting(clean)) {
    return [
      "Hey.",
      "Say what you want to sort out, and I’ll help pull it apart cleanly."
    ].join(" ");
  }

  return [
    "Hinge:",
    "the turning point that changes the answer.",
    "",
    "Facts:",
    "what is known and why it matters.",
    "",
    "Assumptions:",
    "what is still inferred or uncertain.",
    "",
    "Evaluation:",
    "how strong the case is and where the real risk sits.",
    "",
    "What would change my mind:",
    "the evidence that would flip the conclusion.",
    "",
    "Move:",
    "the smallest useful next step."
  ].join("\n");
}

function buildDomainSystemMessage(domainId, currentDomain) {
  const domainLabel = currentDomain?.label || "REI.ai";
  const domainDescription = currentDomain?.description || "reasoning assistant";

  if (domainId === "assistant") {
    return `System initialized. ${getAssistantWelcomeCopy()}`;
  }

  return `System initialized. Welcome to REI.ai ${domainLabel}. ${domainDescription} Let's begin our ${domainId === 'coding' ? 'coding session' : domainId === 'genealogy' ? 'research analysis' : 'story building'}!`;
}

function formatCost(totalTokens, model) {
  const rate = MODEL_COST_PER_1K[model] || MODEL_COST_PER_1K[DEFAULT_COST_MODEL];
  return formatCostDisplay(computeMsgCost(totalTokens, rate));
}

function getCostBadgeLabel(model, tokens) {
  const cost = formatCost(tokens, model);
  return `⚡ ${tokens} tok · ${cost}`;
}

const GENERALIST_PROMPTS = [
  "Help me sort this out",
  "What am I missing here?",
  "What is the real hinge?",
  "Separate facts from assumptions",
  "What would change my mind?"
];

const REASONING_LOOP_STEPS = [
  { id: "facts", label: "Facts", detail: "What is known" },
  { id: "assumptions", label: "Assumptions", detail: "What remains uncertain" },
  { id: "evaluation", label: "Evaluation", detail: "How strong the case is" },
  { id: "change", label: "What changes it", detail: "What would flip the answer" },
  { id: "move", label: "Next move", detail: "Smallest useful step" },
];

function parseAssistantStyleReply(text) {
  if (text == null) text = "";
  const sections = { Hinge: "", Facts: "", Assumptions: "", Evaluation: "", ChangeMind: "", Move: "", intro: "" };
  const cleaned = text.replace(/\*\*/g, "").replace(/^\s*[-*]\s+/gm, "• ");
  const lines = cleaned.split("\n").map((line) => line.trim()).filter(Boolean);
  let current = "intro";
  for (const rawLine of lines) {
    const line = rawLine.replace(/^•\s*/, "");
    const inlineMatch = line.match(/^(Hinge|Facts|Assumptions|Evaluation|Move|Next move|Next step|What would change my mind|What would change my mind\?):?\s*(.*)$/i);
    if (inlineMatch) {
      const normalized = inlineMatch[1].trim().toLowerCase();
      const keyMap = {
        hinge: "Hinge",
        facts: "Facts",
        assumptions: "Assumptions",
        evaluation: "Evaluation",
        move: "Move",
        "next move": "Move",
        "next step": "Move",
        "what would change my mind": "ChangeMind",
        "what would change my mind?": "ChangeMind",
      };
      const key = keyMap[normalized] || null;
      const rest = inlineMatch[2].trim();
      if (key) {
        current = key;
        if (rest) {
          sections[key] = sections[key] ? `${sections[key]} ${rest}` : rest;
        }
        continue;
      }
    }
    if (current === "intro") {
      sections.intro = sections.intro ? `${sections.intro} ${line}` : line;
    } else {
      sections[current] = sections[current] ? `${sections[current]} ${line}` : line;
    }
  }
  return sections;
}

// ── Ingest Panel Component ──
function IngestPanel({ selectedDomain, rawRecordText, setRawRecordText, showIngest, setShowIngest, recordSourceType, setRecordSourceType }) {
  if (selectedDomain !== "genealogy") return null;

  const charCount = rawRecordText.length;
  const overLimit = charCount > MAX_RECORD_CHARS;
  const nearLimit = charCount > MAX_RECORD_CHARS * 0.85;

  return (
    <div style={{ width: "100%", marginBottom: "10px" }}>
      <button
        type="button"
        onClick={() => setShowIngest((v) => !v)}
        style={{
          background: "rgba(251,146,60,0.08)",
          border: "1px solid rgba(251,146,60,0.25)",
          color: "#fdba74",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12.5px",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: showIngest ? "8px" : "0",
        }}
      >
        {showIngest ? "− Hide Record Ingest" : "+ Paste a Record (Ancestry / FamilySearch / Find A Grave)"}
      </button>

      {showIngest && (
        <div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
            {SOURCE_TYPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setRecordSourceType(s.id)}
                style={{
                  fontSize: "11px",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: recordSourceType === s.id
                    ? "1px solid #f97316"
                    : "1px solid rgba(255,255,255,0.1)",
                  background: recordSourceType === s.id
                    ? "rgba(249,115,22,0.18)"
                    : "rgba(255,255,255,0.02)",
                  color: recordSourceType === s.id ? "#fed7aa" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <textarea
            value={rawRecordText}
            onChange={(e) => setRawRecordText(e.target.value)}
            placeholder="Paste raw record text here — Ancestry transcript, FamilySearch page text, Find A Grave memorial details, census entry, etc. REI will evaluate and tier it as evidence alongside your question."
            rows={6}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.25)",
              border: overLimit
                ? "1px solid #ef4444"
                : "1px solid rgba(251,146,60,0.2)",
              borderRadius: "8px",
              color: "#E2E8F0",
              fontSize: "12.5px",
              padding: "10px 12px",
              fontFamily: "monospace",
              resize: "vertical",
            }}
          />

          {charCount > 0 && (
            <div
              style={{
                fontSize: "11px",
                marginTop: "4px",
                color: overLimit ? "#f87171" : nearLimit ? "#fbbf24" : "#94a3b8",
              }}
            >
              {charCount.toLocaleString()} / {MAX_RECORD_CHARS.toLocaleString()} characters
              {overLimit && " — too long, trim before sending"}
              {!overLimit && nearLimit && " — approaching limit"}
              {!overLimit && !nearLimit && " — will attach to your next message, then clear"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── HingeMark Logo Component ──
function HingeMark({ size = 36, animated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pivot pin */}
      <circle cx="18" cy="18" r="2.2" fill="#1a0d08" />

      {/* Fixed arm */}
      <path
        d="M18 18 L18 6"
        stroke="#1a0d08"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18 6 L26 6"
        stroke="#1a0d08"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Swinging arm */}
      <g
        style={
          animated
            ? {
                transformOrigin: "18px 18px",
                animation: "rei-hinge-swing 1.1s ease-in-out infinite",
              }
            : undefined
        }
      >
        <path
          d="M18 18 L18 30"
          stroke="#1a0d08"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M18 30 L26 30"
          stroke="#1a0d08"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {animated && (
        <style>{`
          @keyframes rei-hinge-swing {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-18deg); }
          }
        `}</style>
      )}
    </svg>
  );
}

/**
 * REI Core Component - Fortis et Liber Implementation:
 * 
 * 1. Leverage - Domain-specific reasoning:
 *    - Assistant: CARDO REI structured reasoning
 *    - Coding: Verification-first development
 *    - Genealogy: Evidence-tiered analysis
 *    - Story: Narrative architecture
 * 
 * 2. Surface Area - Minimal interfaces:
 *    - Focused domain selection
 *    - Clear input boundaries
 *    - Explicit state management
 * 
 * 3. Recoil - Managed challenges:
 *    - Input validation
 *    - Error fallbacks
 *    - Clear user feedback
 * 
 * 4. Enumeration - Tracked decisions:
 *    - Routing metadata
 *    - Model selection
 *    - Performance characteristics
 * 
 * 5. Parity - Balanced interactions:
 *    - Equal treatment of domains
 *    - Consistent UX patterns
 *    - Fair resource allocation
 * 
 * 6. Solvency - Guaranteed completion:
 *    - Local fallback generation
 *    - Clean error states
 *    - Persistent history
 * 
 * 7. Conservation - Efficient operation:
 *    - Optimized renders
 *    - Right-sized responses
 *    - Minimal re-renders
 */
// Named exports for testing
export { parseAssistantStyleReply, buildDomainSystemMessage, getAssistantWelcomeCopy };

export default function REI() {
  // Mobile detection
  const mobile = useMobile();
  const keyboardVisible = useKeyboardVisible();
  const inputRows = mobile ? 3 : 5;

  const inputRef = useRef(null);

  // Scroll input into view when keyboard opens
  useEffect(() => {
    if (keyboardVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, [keyboardVisible]);

  // Copy text to clipboard function
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const retryMessage = (msgIndex) => {
    const userMsg = messages[msgIndex - 1];
    if (userMsg?.sender !== "user") return;
    setInputMessage(userMsg.text);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const [isPhilosophyOpen, setIsPhilosophyOpen] = useState(false);

  const [selectedDomain, setSelectedDomain] = useState("assistant");
  const [rawRecordText, setRawRecordText] = useState("");
  const [showIngest, setShowIngest] = useState(false);
  const [recordSourceType, setRecordSourceType] = useState("other");

  const [inputMessage, setInputMessage] = useState("");

  const {
    messages, setMessages, isTyping, setIsTyping,
    chatEndRef, assistantPromptIndex, setAssistantPromptIndex,
    handleClearHistory,
  } = useChatHistory(selectedDomain, buildDomainSystemMessage, DOMAIN_PROFILES);

  const { thriftyMode, toggleThriftyMode } = useThriftyMode();

  const {
    sessionTokens, sessionMessages, sessionCost, modelBreakdown,
    showSessionSummary, setShowSessionSummary,
    trackMessage, resetSession,
  } = useSessionTracker();

  const { domainHint, updateDomainHint, dismissDomainHint, switchDomain } = useDomainHint(selectedDomain);

  const currentDomain = DOMAIN_PROFILES.find((d) => d.id === selectedDomain) || DOMAIN_PROFILES[0];

  // Prevent a pasted record from leaking into a different domain
  useEffect(() => {
    setRawRecordText("");
    setShowIngest(false);
    setRecordSourceType("other");
  }, [selectedDomain]);

  function handleInputChange(value) {
    setInputMessage(value);
    updateDomainHint(value);
  }

  /**
   * Handles message sending with Fortis et Liber exit strategies:
   * 1. Early rejection of empty input
   * 2. Record length validation
   * 3. Fallback response on API failure
   * 4. Clean state maintenance
   */
  async function handleSendMessage(e) {
    e.preventDefault();
    // Principle of Surface Area: Minimal input validation
    if (!inputMessage.trim()) {
      setMessages(prev => [...prev, {
        sender: "rei",
        text: "Empty input rejected per minimum effective contact principle",
        timestamp: new Date().toLocaleTimeString(),
        isSystemNotice: true
      }]);
      return;
    }

    const ingestedRecord = rawRecordText.trim();

    // Pre-send guard — fail fast, locally, instead of round-tripping to the backend only to get rejected there.
    if (ingestedRecord.length > MAX_RECORD_CHARS) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "rei",
          text: `That pasted record is ${ingestedRecord.length.toLocaleString()} characters — over the ${MAX_RECORD_CHARS.toLocaleString()} limit. Trim it to the relevant section (e.g. just the entry for the person in question) and try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true,
        },
      ]);
      return; // don't clear the textarea — let them edit and resend
    }

    const userMsg = {
      id: nextMessageId(),
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedRecord: ingestedRecord
        ? { charCount: ingestedRecord.length, sourceType: recordSourceType }
        : null,
    };

    setIsTyping(true);

    // Capture and clear ingest state up front, so it can't accidentally attach to a later, unrelated message.
    setRawRecordText("");
    setShowIngest(false);
    setRecordSourceType("other");

    try {
      const systemContext = selectedDomain;

      // Format previous chat history to send to backend (last 10 messages, filtering out system init messages)
      const historyPayload = messages
        .filter(msg => !msg.text.startsWith("System initialized"))
        .slice(-10)
        .map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text
        }));

      const sourceLabel = SOURCE_TYPES.find((s) => s.id === recordSourceType)?.label || "Other / unspecified";

      const recordBlock = ingestedRecord
        ? `\n\nIngested Source Record (pasted by user, source: ${sourceLabel} — treat as raw, unverified material to evaluate and tier, not as established fact):\n"""\n${ingestedRecord}\n"""\n`
        : "";

      const routerDecision = buildRouterDecision({
        input: userMsg.text,
        domain: selectedDomain,
        history: historyPayload,
        attachedRecord: ingestedRecord,
        thrifty: thriftyMode,
      });

      // Call route handler API with domain-specific context
      const response = await fetch('/api/cfai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'score',
          input: userMsg.text,
          systemPrompt: systemContext,
          domain: selectedDomain,
          domainLabel: currentDomain.label,
          domainRules: currentDomain.rules,
          recordBlock,
          history: historyPayload,
          routerDecision,
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server returned failure response status');
      }

      const usage = data.usage || null;
      const responseModel = data.model || "Local cfai CLI Executable";
      const totalTokens = usage?.total_tokens || 0;
      const modelRate = MODEL_COST_PER_1K[responseModel] || MODEL_COST_PER_1K[DEFAULT_COST_MODEL];
      const msgCost = computeMsgCost(totalTokens, modelRate);

      trackMessage(totalTokens, responseModel, msgCost);

      const evidence = selectedDomain === "genealogy"
        ? parseEvidenceTiers(data.result)
        : [];

      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: nextMessageId(),
          sender: "rei",
          text: data.result,
          timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          usage,
          model: responseModel,
          cost: msgCost,
          routerDecision: data.routerDecision || routerDecision,
          evidence: evidence.length > 0 ? evidence : undefined,
        }
      ]);
    } catch (error) {
      console.error('REI.ai API error:', error);

      const isNetworkError = error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch');
      const errorType = isNetworkError ? 'Network error' : 'Server error';

      const fallbackText = `[Backend unavailable — ${errorType}]
${error.message}

${isNetworkError ? 'Check your connection and try again.' : 'The server encountered an issue. Please try again.'}`;

      const fallbackMsg = {
        id: nextMessageId(),
        sender: "rei",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fallback: true,
        error: error.message,
        errorType,
      };

      setMessages((prev) => [...prev, userMsg, fallbackMsg]);
    } finally {
      setIsTyping(false);
      setInputMessage("");
    }
  }

  return (
    <div
      className="mobile-container safe-area rei-shell"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        maxWidth: mobile ? undefined : "1400px",
        marginLeft: mobile ? undefined : "auto",
        marginRight: mobile ? undefined : "auto"
      }}
    >
      {/* Sticky Header with safe area top */}
      <header className="safe-top rei-header">
          <div className="rei-header__brand">
            {/* Logo Mark */}
            <div className="rei-logo-mark">
              <HingeMark size={28} animated={true} />
            </div>
            <div>
              <h1 className="rei-logo-title">REI.ai</h1>
              <p className="rei-logo-sub">
                Latin: <em>Rei</em> (The Matter / Hinge) &nbsp;|&nbsp; Loop: <strong>Record • Evaluate • Iterate</strong>
              </p>
            </div>
          </div>
 
          {/* Domain selection tab strip */}
          <div className="rei-domain-tabs">
            {DOMAIN_PROFILES.map((dom) => (
              <button
                key={dom.id}
                type="button"
                onClick={() => setSelectedDomain(dom.id)}
                className={`rei-domain-tab ${selectedDomain === dom.id ? "is-active" : ""}`}
              >
                <span>{dom.label}</span>
                <span style={{ fontSize: "10px", fontWeight: 400, opacity: 0.7, textTransform: "none", marginTop: "1px" }}>
                  {dom.id === "assistant" ? "Everyday reasoning" :
                   dom.id === "coding" ? "Senior coding logic" :
                   dom.id === "genealogy" ? "Evidence-tiered genealogy" :
                   "Narrative architecture"}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={toggleThriftyMode}
              className="rei-action-btn"
              style={{
                background: thriftyMode ? "rgba(74,222,128,0.15)" : "transparent",
                borderColor: thriftyMode ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)",
                color: thriftyMode ? "#4ade80" : "#94a3b8",
              }}
              title={thriftyMode ? "Thrifty mode on — using cheapest model" : "Thrifty mode off — using default routing"}
            >
              {thriftyMode ? "💰 Thrifty" : "💰 Full"}
            </button>
            <button
              type="button"
              onClick={handleClearHistory}
              className="rei-action-btn rei-action-btn--danger"
            >
              Clear Chat
            </button>
            <button
              type="button"
              onClick={() => setIsPhilosophyOpen(true)}
              className="rei-action-btn rei-action-btn--accent"
            >
              (?) Philosophy
            </button>
          </div>
        </header>

        {/* Scrollable Main Content with keyboard space */}
        <main className="flex-1 overflow-y-auto pb-32 rei-main-content">
          {/* Active Domain Info Banner (Custom Card Style) */}
          <div className="rei-domain-banner">
            <div className="rei-domain-banner__eyebrow">Active Voice</div>
            <div className="rei-domain-banner__row">
              <div className="rei-domain-banner__meta">
                <span className="rei-domain-banner__label">Mode:</span>
                <span>{currentDomain.description}</span>
              </div>
              <div className="rei-domain-banner__meta rei-domain-banner__meta--secondary">
                <span className="rei-domain-banner__label">Voice cues:</span>
                <span>{currentDomain.rules.join(" | ")}</span>
              </div>
            </div>
            {selectedDomain === "assistant" && (
               <>
                 <div className="rei-reasoning-loop">
                   {REASONING_LOOP_STEPS.map((step) => (
                     <div key={step.id} className="rei-reasoning-loop__step">
                       <span className="rei-reasoning-loop__label">{step.label}</span>
                       <span className="rei-reasoning-loop__detail">{step.detail}</span>
                     </div>
                   ))}
                 </div>
                 <div className="rei-domain-banner__steps">
                   {["Collect", "Analyze", "Record", "Distinguish", "Organize", "Review", "Evaluate", "Iterate"].map((step) => (
                     <span key={step} className="rei-domain-banner__step">
                       {step}
                     </span>
                   ))}
                 </div>
               </>
            )}
          </div>

        {/* Ingest Panel - only shown for genealogy domain */}
        <IngestPanel
          selectedDomain={selectedDomain}
          rawRecordText={rawRecordText}
          setRawRecordText={setRawRecordText}
          showIngest={showIngest}
          setShowIngest={setShowIngest}
          recordSourceType={recordSourceType}
          setRecordSourceType={setRecordSourceType}
        />

        {/* Domain Hint Banner — detects input mismatch */}
        {domainHint && (
          <div className="rei-domain-hint" style={{
            margin: "8px 12px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "rgba(251,191,36,0.12)",
            border: "1px solid rgba(251,191,36,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            fontSize: "13px",
            color: "#fbbf24",
          }}>
            <span>
              This looks like a <strong>{domainHint}</strong> question.
              Switch to{' '}
              <strong>{DOMAIN_PROFILES.find(d => d.id === domainHint)?.label || domainHint}</strong>?
            </span>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedDomain(switchDomain(domainHint));
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: "none",
                  background: "rgba(251,191,36,0.3)",
                  color: "#fbbf24",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Switch
              </button>
              <button
                type="button"
                onClick={dismissDomainHint}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Chat Interface Container */}
        <div className="rei-chat-container">
          
          {/* Chat History Area */}
          <div className="rei-chat-history" role="log" aria-live="polite" aria-label="Chat messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`rei-chat-message ${msg.sender === "user" ? "rei-chat-message--user" : "rei-chat-message--rei"}`}
                style={{
                  maxWidth: "95%",
                  width: "100%"
                }}
                onAnimationEnd={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {msg.sender === "user" && msg.attachedRecord && (
                  <div style={{
                    fontSize: "10.5px",
                    color: "#fdba74",
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    📋 Record attached — {msg.attachedRecord.sourceType} ({msg.attachedRecord.charCount.toLocaleString()} chars)
                  </div>
                )}
                {msg.sender === "rei" && (
                  <RouterBadge
                    routerDecision={msg.routerDecision}
                    usage={msg.usage}
                  />
                )}
                <div
                  className={`rei-chat-bubble ${msg.sender === "user" ? "rei-chat-bubble--user" : "rei-chat-bubble--rei"}`}
                  style={{
                    padding: "10px 60px 10px 14px"
                  }}
                >
                  {selectedDomain === "assistant" && msg.sender === "rei" && !msg.fallback ? (
                    (() => {
                      const sections = parseAssistantStyleReply(msg.text);
                      const sectionOrder = [
                        { key: "Hinge", label: "Hinge" },
                        { key: "Facts", label: "Facts" },
                        { key: "Assumptions", label: "Assumptions" },
                        { key: "Evaluation", label: "Evaluation" },
                        { key: "ChangeMind", label: "What would change my mind" },
                        { key: "Move", label: "Move" },
                      ];
                      const visibleSections = sectionOrder.filter(({ key }) => sections[key] && sections[key].trim());
                      return sections.intro || visibleSections.length > 0 ? (
                        <div style={{ display: "grid", gap: "10px" }}>
                          {sections.intro && <div>{sections.intro}</div>}
                          {visibleSections.map(({ key, label }) => (
                            <div key={key}>
                              <div style={{ color: "#fb923c", fontSize: "0.85em", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{label}</div>
                              <div>{sections[key]}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>{msg.text}</div>
                      );
                    })()
                  ) : (
                    msg.text
                  )}

                  {/* Router summary */}
                  <RouterPanel
                    routerDecision={msg.routerDecision}
                    model={msg.model}
                  />
                  <button
                    onClick={() => copyText(msg.text)}
                    className="rei-copy-btn touch-target"
                    aria-label="Copy message"
                    style={{
                      fontSize: mobile ? "0.85em" : "0.75em",
                      padding: mobile ? "6px 10px" : "2px 6px"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                    onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                    title="Copy message"
                  >
                    Copy
                  </button>
                  {msg.fallback && (
                    <button
                      onClick={() => retryMessage(index)}
                      className="rei-copy-btn touch-target"
                      aria-label="Retry request"
                      style={{
                        fontSize: mobile ? "0.85em" : "0.75em",
                        padding: mobile ? "6px 10px" : "2px 6px",
                        background: "rgba(251,191,36,0.15)",
                        borderColor: "rgba(251,191,36,0.3)",
                        color: "#fbbf24"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                      onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                      title="Retry request"
                    >
                      Retry
                    </button>
                  )}
                </div>
                <span className="rei-chat-meta">
                  {msg.sender === "user" ? "You" : "REI.ai"} • {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div aria-live="polite" aria-label="REI is replying" style={{ 
                alignSelf: "flex-start", 
                color: "#FFB300", 
                fontFamily: "inherit",
                fontSize: "1.02em",
                animation: "pulse 1.5s ease-in-out infinite",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>●</span>
                <span>REI is shaping the reply...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        </main>

        <SessionSummary
          sessionTokens={sessionTokens}
          sessionMessages={sessionMessages}
          sessionCost={sessionCost}
          modelBreakdown={modelBreakdown}
          showSessionSummary={showSessionSummary}
          setShowSessionSummary={setShowSessionSummary}
          formatCost={formatCost}
          selectedDomain={selectedDomain}
          currentDomain={currentDomain}
          thriftyMode={thriftyMode}
          resetSession={resetSession}
        />

        {/* Fixed Input Area at Bottom with safe area */}
        <div className="rei-input-shell fixed bottom-0 safe-bottom" style={{
          maxWidth: mobile ? undefined : "1400px"
        }}>
          <form className="rei-input-form" onSubmit={handleSendMessage}>
            {selectedDomain === "assistant" && (
              <div className="rei-input-row" style={{
                flexWrap: "wrap",
                justifyContent: mobile ? "stretch" : "center"
              }}>
                {GENERALIST_PROMPTS.map((prompt, index) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInputMessage(prompt);
                      setAssistantPromptIndex(index);
                    }}
                    className="rei-quick-prompt"
                    aria-pressed={assistantPromptIndex === index}
                    style={{
                      flex: mobile ? "1 1 30%" : "1 1 auto",
                      minWidth: mobile ? "100px" : "180px"
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <div className="rei-input-row">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={selectedDomain === "assistant" ? "What are you thinking through?" : "Type proof context or statements to evaluate..."}
                className="rei-input-area"
                style={{
                  flex: 1,
                  padding: mobile ? "14px 16px" : "12px 16px",
                  minHeight: "48px"
                }}
              />
              <button
                type="submit"
                className="rei-touch-button touch-target"
                style={{
                  padding: mobile ? "14px 28px" : "12px 24px",
                  minHeight: "48px",
                  height: "48px"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#fb923c"}
                onMouseOut={(e) => e.currentTarget.style.background = "#f97316"}
              >
                Send
              </button>
            </div>
            {/* Pre-send estimate & token budget gauge */}
            {inputMessage.trim() && (
              <div style={{
                padding: "4px 12px 2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                fontSize: "10px",
                color: "#64748b",
              }}>
                <span>
                  ~{estimateInputTokens(inputMessage)} tok →{' '}
                  {buildRouterDecision({ input: inputMessage, domain: selectedDomain, thrifty: thriftyMode }).label}
                  {' · '}
                  {formatCost(estimateInputTokens(inputMessage), "llama-3.3-70b-versatile")}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>Budget:</span>
                  <div style={{
                    width: "60px",
                    height: "4px",
                    borderRadius: "2px",
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${Math.min(100, (sessionTokens / 5000) * 100)}%`,
                      height: "100%",
                      borderRadius: "2px",
                      background: sessionTokens > 4000 ? "#ef4444" : sessionTokens > 2500 ? "#fbbf24" : "#4ade80",
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                  <span>{sessionTokens.toLocaleString()}/5K</span>
                </div>
              </div>
            )}
          </form>
        </div>
      
      {isPhilosophyOpen && <PhilosophyModal onClose={() => setIsPhilosophyOpen(false)} />}
    </div>
  );
}
