export default function RouterPanel({ routerDecision, model }) {
  if (!routerDecision) return null;

  const selectedCost = routerDecision.costPer1kInput + routerDecision.costPer1kOutput;
  const selectedPathway = routerDecision.pathway || "medium";

  return (
    <div className="rei-router-panel" role="region" aria-label="Routing details">
      <div className="rei-router-panel__title">Night Shift routing &bull; Pathway: {selectedPathway}</div>
      <div className="rei-router-panel__grid">
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Route:</span> {routerDecision.label}
        </div>
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Model:</span> {model || routerDecision.model}
        </div>
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Confidence:</span>{" "}
          {routerDecision.routingConfidence != null
            ? `${(routerDecision.routingConfidence * 100).toFixed(0)}%`
            : routerDecision.pathway === "deterministic" ? "100%" : "n/a"}
        </div>
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Est. cost:</span>{" "}
          ${routerDecision.estimatedCost?.toFixed(6) || "0"}
        </div>
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Premium cost:</span>{" "}
          ${routerDecision.premiumCost?.toFixed(6) || "0"}
        </div>
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Quality gate:</span> {routerDecision.qualityGate}
        </div>
        {routerDecision.rationale && (
          <div className="rei-router-panel__why">
            <span className="rei-router-panel__label">Why:</span> {routerDecision.rationale}
          </div>
        )}
        {routerDecision.alternativeRoutes && routerDecision.alternativeRoutes.length > 0 && (
          <div className="rei-router-panel__item--muted">
            <span className="rei-router-panel__label">Also available:</span>{" "}
            {routerDecision.alternativeRoutes.map((alt, i) => (
              <span key={alt.model}>
                {i > 0 && " · "}
                {alt.label}
                {" "}({(alt.costPer1kTotal * 1000).toFixed(2)}¢/1K)
                {alt.costDeltaFromSelected !== 0 && (
                  <span style={{ color: alt.costDeltaFromSelected > 0 ? "#f87171" : "#4ade80" }}>
                    {" "}{alt.costDeltaFromSelected > 0 ? "+" : ""}{alt.savingsPercentage}%
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
