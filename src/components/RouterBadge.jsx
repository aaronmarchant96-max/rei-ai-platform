import { getRouterCosts } from "../lib/nightShiftRouter.js";
import { formatCostDisplay, computeMsgCost } from "../lib/contracts.js";

const FINGERPRINT_COSTS = getRouterCosts();
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
const DEFAULT_COST_MODEL = "llama-3.3-70b-versatile";

function getCostBadgeLabel(model, tokens) {
  const rate = MODEL_COST_PER_1K[model] || MODEL_COST_PER_1K[DEFAULT_COST_MODEL];
  const cost = computeMsgCost(tokens, rate);
  return `⚡ ${tokens} tok · ${formatCostDisplay(cost)}`;
}

export default function RouterBadge({ routerDecision, usage, onToggle }) {
  if (!routerDecision) return null;

  const totalTokens = usage?.total_tokens || routerDecision.estimatedInputTokens || 0;

  return (
    <div className="rei-router-badge" role="status" aria-label={`Routed via ${routerDecision.label} to ${routerDecision.model}`}>
      <span className="rei-router-badge__icon">🌙</span>
      <span>{routerDecision.label}</span>
      <span className="rei-router-badge__model">{routerDecision.model}</span>
      <span className="rei-router-badge__cost">
        {getCostBadgeLabel(routerDecision.model, totalTokens)}
      </span>
    </div>
  );
}
