/**
 * @file Data contracts for REI.ai UI.
 *
 * These are NOT runtime classes — they're JSDoc type definitions.
 * Every component should import these types so the shapes stay
 * consistent. When a shape changes, update it here first.
 */

// ─── RouterDecision ───────────────────────────────────────────
// Produced by buildRouterDecision() in nightShiftRouter.js

/**
 * @typedef {Object} RouterSignal
 * @property {"low"|"medium"|"high"} complexityTier
 * @property {string[]} matchedTerms
 * @property {string[]} highStructureSignals
 * @property {string|null} storedPreference
 */

/**
 * @typedef {Object} AlternativeRoute
 * @property {string} model
 * @property {string} label
 * @property {number} costPer1kTotal
 * @property {string} route
 * @property {string} rationale
 */

/**
 * @typedef {Object} RouterDecision
 * @property {string} id
 * @property {string} label
 * @property {string} model
 * @property {number} maxTokens
 * @property {number} costPer1kInput
 * @property {number} costPer1kOutput
 * @property {number} costPer1k
 * @property {number} estimatedInputTokens
 * @property {string} qualityGate
 * @property {string|null} enforce
 * @property {string} description
 * @property {number} temperature
 * @property {string[]|null} fallbackChain
 * @property {number} contextWindow
 * @property {string} rationale
 * @property {RouterSignal} routingSignals
 * @property {AlternativeRoute[]} alternativeRoutes
 */

// ─── EvidenceTier ─────────────────────────────────────────────
// Extracted from genealogy response text. Designed to extend to all domains.

/**
 * @typedef {"primary"|"strong"|"needs-review"|"family-memory"} TierLevel
 */

/**
 * @typedef {Object} EvidenceTier
 * @property {string} claim
 * @property {TierLevel} tier
 * @property {string} [source]
 * @property {number} [confidence]
 * @property {string} [notes]
 */

// ─── Message ──────────────────────────────────────────────────
// Constructed in handleSendMessage() in REI.jsx.

/**
 * @typedef {Object} AttachedRecord
 * @property {number} charCount
 * @property {"ancestry"|"familysearch"|"findagrave"|"other"} sourceType
 */

/**
 * @typedef {Object} ApiUsage
 * @property {number} total_tokens
 * @property {number} [prompt_tokens]
 * @property {number} [completion_tokens]
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {"user"|"rei"} sender
 * @property {string} text
 * @property {string} timestamp
 * @property {boolean} [isSystemNotice]
 * @property {AttachedRecord} [attachedRecord]
 * @property {ApiUsage} [usage]
 * @property {RouterDecision} [routerDecision]
 * @property {string} [model]
 * @property {number} [cost]
 * @property {EvidenceTier[]} [evidence]
 * @property {string} [error]
 * @property {string} [errorType]
 * @property {boolean} [fallback]
 */

// ─── SessionSummary ───────────────────────────────────────────
// Managed by useSessionTracker() hook.

/**
 * @typedef {Object} SessionSummary
 * @property {number} totalTokens
 * @property {number} totalMessages
 * @property {number} totalCost
 * @property {{ [model: string]: number }} modelBreakdown
 * @property {number} budgetLimit
 */

// ─── DomainProfile ────────────────────────────────────────────
// Defined in REI.jsx, consumed by domain banner + domain pills.

/**
 * @typedef {"assistant"|"coding"|"genealogy"|"story"} DomainId
 */

/**
 * @typedef {Object} DomainProfile
 * @property {DomainId} id
 * @property {string} label
 * @property {string} badge
 * @property {string} description
 * @property {string[]} rules
 * @property {string} exemplar
 */

// ─── Cost helpers ─────────────────────────────────────────────

let msgIdCounter = 0;

export function nextMessageId() {
  return `msg-${++msgIdCounter}`;
}

export function resetMessageIdCounter() {
  msgIdCounter = 0;
}

/**
 * Compute cost in USD for a given token count and model rate.
 * @param {number} totalTokens
 * @param {number} rate - cost per 1K tokens (average of input/output)
 * @returns {number}
 */
export function computeMsgCost(totalTokens, rate) {
  return (totalTokens / 1000) * rate;
}

/**
 * Format a cost number to a display string.
 * @param {number} cost
 * @returns {string}
 */
export function formatCostDisplay(cost) {
  if (cost <= 0) return "~$0.0000";
  if (cost < 0.0001) return "< $0.0001";
  return `~$${cost.toFixed(4)}`;
}

/**
 * Estimate input tokens from text length.
 * @param {string} text
 * @returns {number}
 */
export function estimateInputTokens(text) {
  return Math.ceil((text || "").length / 4);
}
