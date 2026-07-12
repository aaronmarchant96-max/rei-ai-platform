export default function SessionSummary({
  sessionTokens,
  sessionMessages,
  sessionCost,
  modelBreakdown,
  showSessionSummary,
  setShowSessionSummary,
  formatCost,
  selectedDomain,
  currentDomain,
  thriftyMode,
  savingsVsPremium,
  escalationCount,
  resetSession,
}) {
  if (sessionMessages === 0) return null;

  const savingsPercent = sessionCost > 0
    ? Math.round((savingsVsPremium / (sessionCost + savingsVsPremium)) * 100)
    : 0;

  return (
    <div className="rei-session-footer">
      <div className="rei-session-footer__summary">
        <span>&#x1F4CA; <strong>{sessionTokens.toLocaleString()}</strong> tokens &middot; <strong>{sessionMessages}</strong> msgs</span>
        <span className="rei-session-footer__cost">{sessionCost < 0.0001 ? "< $0.0001" : `~$${sessionCost.toFixed(4)}`}</span>
        {savingsVsPremium > 0 && (
          <span className="rei-session-footer__savings">
            Saved ${savingsVsPremium.toFixed(4)} ({savingsPercent}%)
          </span>
        )}
        {escalationCount > 0 && (
          <span className="rei-session-footer__escalations">
            &#x26A1; Escalated {escalationCount}x
          </span>
        )}
        <button
          type="button"
          className="rei-session-footer__toggle"
          onClick={() => setShowSessionSummary((prev) => !prev)}
        >
          {showSessionSummary ? "\u25B2 Hide" : "\u25BC Details"} &middot; Export
        </button>
      </div>
      {showSessionSummary && (
        <div className="rei-session-footer__popup">
          <div className="rei-session-footer__popup-title">Session breakdown</div>
          <div className="rei-session-footer__popup-grid">
            {Object.entries(modelBreakdown).map(([model, tokens]) => (
              <div key={model} className="rei-session-footer__popup-row">
                <span>{model}</span>
                <span>{tokens.toLocaleString()} tok &middot; {formatCost(tokens, model)}</span>
              </div>
            ))}
          </div>
          <div className="rei-session-footer__popup-actions">
            <button
              type="button"
              className="rei-session-footer__popup-btn"
              onClick={() => {
                const lines = [
                  "# REI.ai Session Summary",
                  `# Date: ${new Date().toISOString()}`,
                  `# Domain: ${selectedDomain} (${currentDomain.label})`,
                  `# Thrifty mode: ${thriftyMode ? "on" : "off"}`,
                  "",
                  "## Usage",
                  `Total tokens: ${sessionTokens.toLocaleString()}`,
                  `Total messages: ${sessionMessages}`,
                  `Estimated cost: ${sessionCost < 0.0001 ? "< $0.0001" : `$${sessionCost.toFixed(4)}`}`,
                  "",
                  "## Model breakdown",
                  ...Object.entries(modelBreakdown).map(
                    ([m, t]) => `- ${m}: ${t.toLocaleString()} tokens (${formatCost(t, m)})`
                  ),
                ].join("\n");
                const blob = new Blob([lines], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `rei-session-${Date.now()}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              &#x1F4E5; Download .md
            </button>
            <button
              type="button"
              className="rei-session-footer__popup-btn"
              onClick={resetSession}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
