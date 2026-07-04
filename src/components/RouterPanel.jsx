export default function RouterPanel({ routerDecision, model }) {
  if (!routerDecision) return null;

  return (
    <div className="rei-router-panel" role="region" aria-label="Routing details">
      <div className="rei-router-panel__title">Night Shift routing</div>
      <div className="rei-router-panel__grid">
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Route:</span> {routerDecision.label}
        </div>
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Model:</span> {model || routerDecision.model}
        </div>
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Max tokens:</span> {routerDecision.maxTokens}
        </div>
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Quality gate:</span> {routerDecision.qualityGate}
        </div>
        <div className="rei-router-panel__item">
          <span className="rei-router-panel__label">Enforcement:</span> {routerDecision.enforce || "none"}
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
                {alt.label} ({(alt.costPer1kTotal * 1000).toFixed(2)}¢/1K tok)
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
