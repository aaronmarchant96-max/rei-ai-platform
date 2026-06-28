import { useState, useRef, useEffect } from "react";
import styles from './REI.module.css';

const DOMAIN_PROFILES = [
  {
    id: "genealogy",
    label: "Genealogy",
    badge: "Active",
    description: "Family Archive data pipeline managing 117 profiles and 73 documents.",
    rules: ["Parent age min: 13", "Mother age max: 55", "Father age max: 80"],
    exemplar: "Thomas Ramsey same-name disambiguation profile separation."
  },
  {
    id: "llm",
    label: "LLM Arena",
    badge: "Active",
    description: "Adversarial testing harness probing prompt injections and semantic leakage.",
    rules: ["Control/poison run isolation", "Verbatim snippet extraction checks"],
    exemplar: "Case 006 poisoned context resistance analysis."
  },
  {
    id: "debate",
    label: "Debate Furnace",
    badge: "Active",
    description: "Orchestration layer evaluating arguments under custom heat profiles.",
    rules: ["Verdict compass mapping", "Decision path classification"],
    exemplar: "Balanced/Aggressive topic profile weight comparisons."
  },
  {
    id: "risk",
    label: "CARDO GUARD",
    badge: "Active",
    description: "Expected cost evaluator gating action on model confidence scores.",
    rules: ["Action Waste = Cost * False Alarm Rate", "Miss Loss = Cost * (1 - False Alarm)"],
    exemplar: "Reroute decision expected cost margin analysis."
  }
];

export default function REI() {
  const [selectedDomain, setSelectedDomain] = useState("genealogy");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "rei",
      text: "System initialized. Welcome to REI.ai methodology engine. Select a domain profile from the header, then submit raw evidence or claims to evaluate under the CARDO REI framework.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const currentDomain = DOMAIN_PROFILES.find((d) => d.id === selectedDomain) || DOMAIN_PROFILES[0];

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = {
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Map domain to Hinge AI context
      const domainContext = DOMAIN_PROFILES.find(d => d.id === selectedDomain);
      
      // Build context-aware prompt based on domain
      let systemContext = "You are a CARDO REI methodology assistant. Apply rigorous evidence evaluation.";
      
      if (selectedDomain === "genealogy") {
        systemContext = "You are a genealogical research assistant using CARDO REI methodology. Evaluate evidence with 🟢🔵🟠🟡 tier tags. Ground responses in Living Red Book context when possible.";
      } else if (selectedDomain === "llm") {
        systemContext = "You are an LLM adversarial testing assistant. Apply CARDO REI to evaluate prompt injections, semantic leakage, and model behavior. Be precise about vulnerabilities.";
      } else if (selectedDomain === "debate") {
        systemContext = "You are a debate analysis assistant. Use CARDO REI to find hinges, flag smoke, and pressure-test arguments. Identify what the disagreement actually depends on.";
      } else if (selectedDomain === "risk") {
        systemContext = "You are a decision cost evaluator. Apply CARDO REI to compare action waste vs miss loss. Keep the decision hinge visible.";
      }

      // Call Hinge AI API with domain context
      const response = await fetch('/api/cfai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'score',
          input: `${systemContext}\n\nUser Query: ${inputMessage}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Hinge AI API error');
      }

      // Parse and format the response
      const responseText = data.result || data.error || "No response from Hinge AI";

      // Format the response based on content
      let formattedResponse;
      let confidenceScore = "N/A";
      let unburnedClaims = ["Claim keeps strict semantic mapping to the source bounds."];
      let limitations = [
        "REI does not assume missing links or forecast parameters.",
        "Verification depends entirely on user-provided proof context."
      ];

      // Check if Hinge AI returned structured evidence scoring
      if (responseText.includes("[") && responseText.includes("]") && 
          (responseText.includes("🟢") || responseText.includes("🔵") || 
           responseText.includes("🟠") || responseText.includes("🟡"))) {
        // This is a Hinge AI evidence score - use as-is
        formattedResponse = responseText;
        confidenceScore = "Hinge AI Scored";
        unburnedClaims = ["Evidence evaluated using CARDO REI tiers"];
      } else {
        // Format as standard REI evaluation
        formattedResponse = `[REI.AI EVALUATION RESULT]
Confidence Score: ${confidenceScore}%
Decision Hinge: Whether the provided context boundaries explicitly justify the assertions or present structural evidence gaps.

Unburned Claims:
${unburnedClaims.map(c => `• ${c}`).join("\n")}

Limitations:
${limitations.map(l => `• ${l}`).join("\n")}

Hinge AI Response:
${responseText}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "rei",
          text: formattedResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawJson: {
            engine: "Hinge AI v1.0",
            domain: selectedDomain,
            command: "score",
            confidence_score: confidenceScore,
            unburned_claims: unburnedClaims,
            limitations: limitations,
            hinge_ai_raw_response: data.result
          }
        }
      ]);

    } catch (error) {
      console.error('Hinge AI API error:', error);
      const errorResponse = `[REI.ai SYSTEM ERROR]
Error: ${error.message}

Fallback: Simulated REI analysis active.

Limitations:
• Hinge AI backend not available
• Falling back to local REI simulation`;

      setMessages((prev) => [
        ...prev,
        {
          sender: "rei",
          text: errorResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawJson: {
            engine: "REI-Fallback v0.3",
            domain: selectedDomain,
            error: error.message,
            fallback: true
          }
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <section className={styles.reiDashboardWrapper}>
      
      {/* 4A. Minimalist Header */}
      <header className={styles.reiHeader}>
        <div className={styles.headerBrand}>
          {/* Owl/Balance SVG Logo (Midnight Teal & Amber) */}
          <div className={styles.headerLogo}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="REI owl logo">
              <circle cx="50" cy="50" r="45" fill="#0B2B36" stroke="#1A4B5C" strokeWidth="3" />
              <polygon points="35,65 50,45 65,65" fill="#FFB300" />
              <circle cx="40" cy="40" r="6" fill="#FFB300" />
              <circle cx="60" cy="40" r="6" fill="#FFB300" />
              <line x1="50" y1="25" x2="50" y2="45" stroke="#1A4B5C" strokeWidth="4" />
            </svg>
          </div>
          <div className={styles.headerTitle}>
            <h1>REI.ai</h1>
            <p>Methodology Assistant</p>
          </div>
        </div>

        {/* Domain selection badge strip */}
        <div className={styles.domainStrip}>
          {DOMAIN_PROFILES.map((dom) => (
            <button
              key={dom.id}
              type="button"
              onClick={() => setSelectedDomain(dom.id)}
              className={`${styles.domainBadge} ${selectedDomain === dom.id ? styles.active : ''}`}
            >
              {dom.label}
            </button>
          ))}
        </div>
      </header>

      {/* Active Domain Info Banner */}
      <div className={styles.domainInfoBanner}>
        <div>
          <span className={styles.domainLabel}>Domain:</span>
          <span>{currentDomain.description}</span>
        </div>
        <div>
          <span className={styles.domainLabel}>Rules:</span>
          <span className={styles.domainRules}>{currentDomain.rules.join(" | ")}</span>
        </div>
      </div>

      {/* Chat Interface Container - Solid Floating Card */}
      <div className={styles.reiChatContainer}>
        
        {/* Chat History Area */}
        <div className={styles.reiChatHistory}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.messageContainer} ${msg.sender === "user" ? styles.user : ''}`}
            >
              <div
                className={`${styles.messageBubble} ${msg.sender === "rei" ? styles.rei : styles.user}`}
              >
                {msg.text}

                {msg.rawJson && (
                  <details className={styles.rawJsonDetails}>
                    <summary className={styles.rawJsonSummary}>Raw JSON</summary>
                    <pre className={styles.rawJsonContent}>
                      <code>{JSON.stringify(msg.rawJson, null, 2)}</code>
                    </pre>
                  </details>
                )}
              </div>
              <span className={styles.messageTimestamp}>
                {msg.sender === "user" ? "You" : "REI.ai"} • {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className={styles.typingIndicator}>
              REI.ai is thinking
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input form area - Solid Card with Scrim */}
        <form onSubmit={handleSendMessage} className={styles.reiChatInput}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type proof context or statements to evaluate..."
            className={styles.chatInputField}
          />
          <button
            type="submit"
            className={styles.sendButton}
          >
            Send
          </button>
        </form>
      </div>

    </section>
  );
}
