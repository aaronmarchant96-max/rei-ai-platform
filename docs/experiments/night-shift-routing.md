# Lab Report: Night Shift Fingerprint Router

**Lab:** PromptHound Labs — Applied AI Engineering  
**Date:** 2026-07-03  
**Status:** Complete (v1), Iterating

---

## Experiment

A rule-based, inspectable routing layer that classifies user prompts before model invocation, selecting the cheapest adequate model for each input.

## Question

Can prompt routing be made deterministic, testable, and cost-efficient without relying on a secondary model call? Most routing approaches either use a cheap model to route (double invocation cost) or hard-code static rules that miss edge cases. This experiment tests whether a weighted keyword fingerprint catalog can match human-level routing decisions at near-zero marginal cost.

## Hypothesis

A catalog of domain-specific fingerprints with weighted match terms, negative match terms, and configurable thresholds can route prompts with >= 90% accuracy against a hand-curated test set, using < 1 ms per decision and zero inference cost.

## Implementation

Three-layer architecture:

1. **Fast-path regex gates** (`nightShiftRouter.js:210-228`): `isSimpleGreeting`, `isLikelyCodingRequest`, `isLikelyGenealogyRequest`, `isLikelyStoryRequest`, `isAdversarialRequest` — binary regex checks that short-circuit for obvious cases. These are strict: removed generic words like `record` and `will` that caused false positives.

2. **Weighted catalog matching** (`nightShiftRouter.js:112-139`): `getCatalogRouteMatch` iterates 9 fingerprint entries in `data/fingerprints.json`. Each entry has `matchTerms` (positive signal), `negativeMatchTerms` (subtract 0.8 per hit), and `matchThreshold` (minimum score to activate). Scoring is word-boundary only (`keywordMatches` at line 92) — no fuzzy, no stem, no embedding.

3. **Decision tree** (`nightShiftRouter.js:332-458`): `buildRouterDecision` combines the catalog match with domain preference, stored history, complexity tier, high-structure signals, and thrifty mode override. Every decision includes a rationale string and alternative routes for transparency.

Key architectural choices:
- **Pricing derived from fingerprints** — `costPer1kInput` and `costPer1kOutput` live in `fingerprints.json` as the single source of truth for both routing and cost display
- **Null on miss** — `getCatalogEntry` returns `null` instead of a default, so config errors surface immediately
- **History excluded from routing** — system initialization messages filtered by prefix to prevent "Record" and "will" from the REI greeting poisoning the combined input

## Measurements

| Metric | Value |
|--------|-------|
| Fingerprint entries | 9 |
| Match terms per entry | 10–28 |
| Decision latency | < 1 ms (no inference) |
| Router unit tests | 19 |
| Total test suite | 95 tests, 13 suites |
| Batch test inputs | 28 (9 categories) |
| False positive rate (batch) | 0/28 after fixes |
| Initial bundle size | 339 kB |
| Lines of code (router) | ~490 |
| Cost per decision | $0.00 (no API call) |

Pre-fix vs. post-fix routing for known false positives:

| Input | Before | After |
|-------|--------|-------|
| `System initialized. REI is live.` | Genealogy Deep Dive | Structured Reasoning |
| `Record, Evaluate, Iterate` | Genealogy Deep Dive | Structured Reasoning |
| `I will consider that option` | Genealogy Deep Dive | Structured Reasoning |
| `what makes your code different` | Genealogy Deep Dive | Structured Reasoning |

## Results

The hypothesis held. The weighted catalog approach correctly routes 28/28 test inputs spanning greetings, coding, genealogy, story, adversarial, and general reasoning queries. The router is fully deterministic — same input always produces the same decision — which makes it suitable for regression testing.

The most important finding was **what broke**: generic English words (`record`, `will`) in the hardcoded genealogy regex caused every chat message to route as genealogy when history was included, because the REI system greeting contains "Record, Evaluate, Iterate". Fixing required three coordinated changes: (1) widen the history filter prefix, (2) remove those words from the binary regex, (3) add them as negative match terms in the catalog. No single fix was sufficient — the routing system has multiple entry points that must stay in sync.

## Limitations

- Rule-based matching cannot understand context — "I need to find his last will" and "I will go to the store" both contain "will," and only the weighted catalog + negative terms approach partially disambiguates
- No embedding or semantic similarity — queries phrased unconventionally that don't share keywords with any fingerprint fall through to the generic "Structured Reasoning" route
- Catalog is hand-curated — scaling to 50+ routes would require tooling to synthesize fingerprints from labeled examples
- No A/B testing infrastructure — route quality is measured by hand-curated batch tests, not live user feedback

## Next Iteration

- Build a fingerprint synthesis tool that generates match terms from labeled example sets
- Add a "routing confidence" score exposed in the UI so users can flag low-confidence classifications
- Experiment with a hybrid approach: rule-based for known patterns, lightweight embedding for novel queries
- Expose routing telemetry in the lab reports — track which routes are hit, which are never hit, and which produce the best user outcomes

---

*PromptHound Labs — Applied AI Engineering*  
*"How should AI-assisted work be done well?"*
