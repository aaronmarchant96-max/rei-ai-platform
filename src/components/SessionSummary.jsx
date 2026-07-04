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
  resetSession,
}) {
  if (sessionMessages === 0) return null;

  return (
    <div style={{
      padding: "8px 16px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
      fontSize: "11px",
      color: "#64748b",
      background: "rgba(0,0,0,0.2)",
    }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <span>&#x1F4CA; <strong>{sessionTokens.toLocaleString()}</strong> tokens &middot; <strong>{sessionMessages}</strong> msgs</span>
        <span style={{ color: "#94a3b8" }}>{sessionCost < 0.0001 ? "< $0.0001" : `~$${sessionCost.toFixed(4)}`}</span>
        <button
          type="button"
          onClick={() => setShowSessionSummary((prev) => !prev)}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "11px",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "none"; }}
        >
          {showSessionSummary ? "\u25B2 Hide" : "\u25BC Details"} &middot; Export
        </button>
      </div>
      {showSessionSummary && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          right: "16px",
          background: "#1e293b",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          padding: "12px",
          minWidth: "280px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          zIndex: 100,
          fontSize: "12px",
        }}>
          <div style={{ fontWeight: 600, marginBottom: "8px", color: "#e2e8f0" }}>Session breakdown</div>
          <div style={{ display: "grid", gap: "6px" }}>
            {Object.entries(modelBreakdown).map(([model, tokens]) => (
              <div key={model} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>{model}</span>
                <span>{tokens.toLocaleString()} tok &middot; {formatCost(tokens, model)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", display: "flex", gap: "6px" }}>
            <button
              type="button"
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
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "#e2e8f0",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              &#x1F4E5; Download .md
            </button>
            <button
              type="button"
              onClick={resetSession}
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
