# REI.ai Components

## Data contracts

Every component in this directory consumes types defined in `src/lib/contracts.js`. Refer to that file for the canonical shape of `Message`, `RouterDecision`, `EvidenceTier`, `SessionSummary`, and `DomainProfile`.

## Component catalogue

### ChatMessage
**File:** `ChatMessage.jsx`  
**Contract:** `Message`, `RouterDecision`, `EvidenceTier`

Renders a single chat message with sender header (avatar initial + name + timestamp), speech bubble with asymmetric border-radius, structured reply parsing via `parseAssistantStyleReply` (assistant domain), EvidenceCards when `msg.evidence` exists (genealogy domain), RouterPanel (collapsed by default), and hover-revealed copy/retry icon buttons.

Props: `msg`, `index`, `selectedDomain`, `onCopy`, `onRetry`

### ContextPanel
**File:** `ContextPanel.jsx`  
**Contract:** `Message`

Right-side slide-in panel (360px) showing structured reasoning sections from the last REI message. Sections: Hinge Point, Facts vs Assumptions (split into Known/Inferred), What Would Change the Conclusion, Evidence Tiers, Evaluation, Next Move, and Routing metadata. Empty state when no structured reasoning is present. Toggle via "CONTEXT" vertical button on right edge.

Props: `message`, `isOpen`, `onClose`

### RouterBadge
**File:** `RouterBadge.jsx`  
**Contract:** `RouterDecision`

Compact inline badge showing route label, model name, and estimated cost. Uses cost computation from `src/lib/costHelpers.js`.

Props: `routerDecision`, `usage`

### RouterPanel
**File:** `RouterPanel.jsx`  
**Contract:** `RouterDecision`

Collapsed-by-default routing detail panel. Summary line shows pathway + savings %. Click to expand full grid: pathway, confidence, estimated/premium cost, quality gate, rationale, and alternative routes with cost deltas and savings percentages.

Props: `routerDecision`, `model`

### EvidenceCard
**File:** `EvidenceCard.jsx`  
**Contract:** `EvidenceTier`

Tier-styled card for genealogy evidence claims. Four tiers with distinct colors:
- Primary Source (green)
- Strong Evidence (blue)
- Needs Review (amber)
- Family Memory (red)

Also exports `parseEvidenceTiers(text)` and `estimateEvidenceTokens(claim)`.

### IngestPanel
**File:** `IngestPanel.jsx`

Record ingest panel for genealogy domain. Toggles open/closed, provides source type selection (Ancestry, FamilySearch, Find A Grave, Other), paste textarea with character limit guard. Also exports `MAX_RECORD_CHARS` and `SOURCE_TYPES` constants used by `REI.jsx`.

### PhilosophyModal
**File:** `PhilosophyModal.jsx`

Full-screen modal overlay explaining the three concepts behind R.E.I.: Latin (Rei — the hinge), Operational (Record/Evaluate/Iterate), and Physics (Refractive Index).

Props: `onClose`

### SessionSummary
**File:** `SessionSummary.jsx`  
**Contract:** `SessionSummary`

Session token/cost accumulator shown below the chat. Shows savings vs premium, escalation count, expandable breakdown by model, markdown export, and reset.

Props: `sessionTokens`, `sessionMessages`, `sessionCost`, `modelBreakdown`, `showSessionSummary`, `setShowSessionSummary`, `formatCost`, `selectedDomain`, `currentDomain`, `thriftyMode`, `savingsVsPremium`, `escalationCount`, `resetSession`

## Shared modules

### src/lib/contracts.js
JSDoc type definitions for all data contracts. Also exports reusable helpers: `computeMsgCost`, `formatCostDisplay`, `estimateInputTokens`, `nextMessageId`.

### src/lib/costHelpers.js
Centralized cost model. Builds `MODEL_COST_PER_1K` map from `getRouterCosts()`, exports `getModelCostRate(model)`, `getCostBadgeLabel(model, tokens)`, and `DEFAULT_COST_MODEL`. Consumed by `REI.jsx`, `RouterBadge.jsx`, and `SessionSummary.jsx`.

### src/lib/replyParser.js
Parses structured CARDO REI replies into sections (Hinge, Facts, Assumptions, Evaluation, ChangeMind, Move). Used by `ChatMessage.jsx` and `ContextPanel.jsx`, and exported from `REI.jsx` for the prompt evaluation test suite.

### src/lib/deterministicEngine.js
Layer 0 zero-token engine. Pattern-matches greetings and smalltalk against regex templates. Returns pre-written responses with zero API calls, zero cost, zero latency. Used by `nightShiftRouter.js` — runs before the fingerprint catalog.

### src/lib/cardoGuard.js
Deterministic decision gate. `calculateCardoGuardReview()` computes whether acting is worth the cost using breakeven math and confidence bands. `shouldEscalateToRemote()` acts as a cost-governor — determines whether expensive inference is justified for a given routing decision.

## Style

All REI-specific styles live in `src/rei.css`. The global app shell styles are in `src/style.css`. No styles are injected via JavaScript. Design system tokens defined as CSS custom properties at the top of `src/rei.css` (`--rei-bg`, `--rei-surface`, `--rei-accent`, etc.).
