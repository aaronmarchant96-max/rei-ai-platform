import { useState } from "react";

export default function RouterPanel({ routerDecision, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded || false);
  if (!routerDecision) return null;

  return (
    <div className="rei-router-panel" role="region" aria-label="Routing details">
      <button
        type="button"
        className="rei-router-panel__summary"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="rei-router-panel__summary-label">Routing</span>
        <span className="rei-router-panel__toggle">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="rei-router-panel__grid">
          <div className="rei-router-panel__item">
            <span className="rei-router-panel__label">Pathway</span>
            <span>{routerDecision.pathway || "medium"}</span>
          </div>
          <div className="rei-router-panel__item">
            <span className="rei-router-panel__label">Confidence</span>
            <span>
              {routerDecision.routingConfidence != null
                ? `${(routerDecision.routingConfidence * 100).toFixed(0)}%`
                : routerDecision.pathway === "deterministic" ? "100%" : "n/a"}
            </span>
          </div>
          <div className="rei-router-panel__item">
            <span className="rei-router-panel__label">Est. cost</span>
            <span>${routerDecision.estimatedCost?.toFixed(6) || "0"}</span>
          </div>
          <div className="rei-router-panel__item">
            <span className="rei-router-panel__label">Premium cost</span>
            <span>${routerDecision.premiumCost?.toFixed(6) || "0"}</span>
          </div>
          <div className="rei-router-panel__item">
            <span className="rei-router-panel__label">Gate</span>
            <span>{routerDecision.qualityGate}</span>
          </div>
          {routerDecision.routingComplexity && (
            <div className="rei-router-panel__item rei-router-panel__item--full">
              <span className="rei-router-panel__label">Complexity</span>
              <span>
                {routerDecision.routingComplexity.score} ({routerDecision.routingComplexity.tier})
                <span className="rei-router-panel__detail">
                  {" "}W: {routerDecision.routingComplexity.words}&times;2 &middot; Q: {routerDecision.routingComplexity.questionMarks}&times;8 &middot; U: {routerDecision.routingComplexity.uncertaintyHits}&times;10
                </span>
              </span>
            </div>
          )}
          {routerDecision.escalated && routerDecision.escalationReason && (
            <div className="rei-router-panel__item rei-router-panel__item--full">
              <span className="rei-router-panel__label">Escalated</span>
              <span>{routerDecision.escalationReason}</span>
            </div>
          )}
          {routerDecision.escalatedByDepth && (
            <div className="rei-router-panel__item rei-router-panel__item--full">
              <span className="rei-router-panel__label">Depth Gate</span>
              <span>Base model response was too shallow. Escalated to premium for quality.</span>
            </div>
          )}
          {routerDecision.rationale && (
            <div className="rei-router-panel__why">
              <span className="rei-router-panel__label">Why</span>
              <span>{routerDecision.rationale}</span>
            </div>
          )}
          {routerDecision.routingSignals && (
            <div className="rei-router-panel__item rei-router-panel__item--full">
              <span className="rei-router-panel__label">Signals</span>
              <span>
                {routerDecision.matchedPattern
                  ? `Pattern: ${routerDecision.matchedPattern}`
                  : routerDecision.routingSignals.matchedTerms?.length > 0
                    ? `Matched: ${routerDecision.routingSignals.matchedTerms.join(", ")}`
                    : "No specific terms matched"}
                {" &middot; "}Complexity: {routerDecision.routingComplexity?.tier || routerDecision.routingSignals?.complexityTier || "n/a"}
              </span>
            </div>
          )}
          {routerDecision.alternativeRoutes && routerDecision.alternativeRoutes.length > 0 && (
            <div className="rei-router-panel__item rei-router-panel__item--full rei-router-panel__item--muted">
              <span className="rei-router-panel__label">Alternatives</span>
              <span>
                {routerDecision.alternativeRoutes.map((alt, i) => (
                  <span key={alt.model}>
                    {i > 0 && " &middot; "}
                    {alt.label}{" "}({(alt.costPer1kTotal * 1000).toFixed(2)}&cent;/1K)
                    {alt.costDeltaFromSelected !== 0 && (
                      <span style={{ color: alt.costDeltaFromSelected > 0 ? "#f87171" : "#4ade80" }}>
                        {" "}{alt.costDeltaFromSelected > 0 ? "+" : ""}{alt.savingsPercentage}%
                      </span>
                    )}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
