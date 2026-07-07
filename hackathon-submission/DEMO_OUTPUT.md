# Night Shift Router — Demo Output

## Two-prompt demo
```
══════════════════════════════════════════════════════════════════════
  NIGHT SHIFT ROUTER — Competition Demo
  The cheapest model that still meets the confidence bar.
══════════════════════════════════════════════════════════════════════

  Prompt:  "hello"
  ──────────────────────────────────────────────────────────────────
  Route:   Simple Greeting
  Pathway: deterministic
  Model:   deterministic
  Confidence: 100%
  Est. cost:      $0.000000
  Premium cost:   $0.000025
  Savings:  100%
  Reason:   Greeting or smalltalk detected; routed through Layer 0 deterministic engine. No API call required.
  Alternatives:
    Simple Greeting — 0.10¢/1K tok 0% (cheap)
    Translation — 0.10¢/1K tok 0% (cheap)
    Structured Reasoning — 1.38¢/1K tok 0% (medium)
    Coding Hinge — 1.38¢/1K tok 0% (medium)

  Prompt:  "prove my argument wrong about remote work productivity"
  ──────────────────────────────────────────────────────────────────
  Route:   Adversarial Validation
  Pathway: premium
  Model:   gpt-4o
  Confidence: n/a (threshold-based)
  Est. cost:      $0.018925
  Premium cost:   $0.018925
  Savings:  0%
  Reason:   Adversarial or red-team request detected; use the premium validation path.
  Alternatives:
    Simple Greeting — 0.10¢/1K tok -99% (cheap)
    Translation — 0.10¢/1K tok -99% (cheap)
    Structured Reasoning — 1.38¢/1K tok -89% (medium)
    Coding Hinge — 1.38¢/1K tok -89% (medium)

══════════════════════════════════════════════════════════════════════
  BENCHMARK SUITE
══════════════════════════════════════════════════════════════════════
  Prompts:  57 across 9 categories (greeting, coding, genealogy,
            creative, fact-check, reasoning, mixed, adversarial, unknown)
  Savings:  68% vs always-premium routing
  Pathways: 5 deterministic · 14 cheap · 33 medium · 5 premium
  Tests:    162 total · 15 suites · all passing
  Run:      npm test -- --testPathPatterns=routingEval
══════════════════════════════════════════════════════════════════════

  Docker: docker compose up
  Benchmarks: npm test -- --testPathPatterns=routingEval
  Architecture: docs/ARCHITECTURE.md

```

## Single prompt: coding
```

Night Shift Router — Single Prompt

  Prompt:  "write a python function to sort a list"
  ──────────────────────────────────────────────────────────────────
  Route:   Coding Hinge
  Pathway: medium
  Model:   llama-3.3-70b-versatile
  Confidence: 100%
  Est. cost:      $0.000842
  Premium cost:   $0.007625
  Savings:  89%
  Reason:   Coding language detected; route through the verification-first coding path.
  Alternatives:
    Simple Greeting — 0.10¢/1K tok -93% (cheap)
    Translation — 0.10¢/1K tok -93% (cheap)
    Structured Reasoning — 1.38¢/1K tok 0% (medium)
    Coding Hinge — 1.38¢/1K tok 0% (medium)
```

## Single prompt: genealogy
```

Night Shift Router — Single Prompt

  Prompt:  "who were the parents of Josiah Ramsey Sr"
  ──────────────────────────────────────────────────────────────────
  Route:   Structured Reasoning
  Pathway: medium
  Model:   llama-3.3-70b-versatile
  Confidence: n/a (threshold-based)
  Est. cost:      $0.000566
  Premium cost:   $0.005125
  Savings:  89%
  Reason:   No special-case fingerprint matched; use the balanced reasoning profile.
  Alternatives:
    Simple Greeting — 0.10¢/1K tok -93% (cheap)
    Translation — 0.10¢/1K tok -93% (cheap)
    Structured Reasoning — 1.38¢/1K tok 0% (medium)
    Coding Hinge — 1.38¢/1K tok 0% (medium)
```
