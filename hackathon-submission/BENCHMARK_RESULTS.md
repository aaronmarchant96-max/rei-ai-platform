# Night Shift Router — Benchmark Results

## Overview

| Metric | Value |
|--------|-------|
| Total prompts evaluated | 57 |
| Categories | 9 (greeting, coding, genealogy, creative, fact-check, reasoning, mixed, adversarial, unknown) |
| Routing accuracy | 80% (36 correct, 9 incorrect) |
| Test suites | 15 |
| Total tests | 162 |
| Inference cost | $0 (deterministic assertions only) |

## Pathway Breakdown

| Pathway | Count | Cost |
|---------|-------|------|
| Deterministic (Layer 0, $0) | 5 | $0.000000 |
| Cheap (llama-3.1-8b) | 1 | ~$0.0001 |
| Medium (llama-3.3-70b) | 46 | ~$0.0005 |
| Premium (gpt-4o) | 5 | ~$0.0020 |

## Cost Analysis

| Metric | Value |
|--------|-------|
| Total actual cost | $0.129332 |
| Total premium-always cost | $0.409550 |
| **Savings** | **$0.280218 (68%)** |
| Queries handled deterministically ($0) | 5 |
| Escalation rate (to premium) | 9% |

## How to Reproduce

```bash
npm test -- --testPathPatterns=routingEval
```

All 57 benchmarks and gate assertions pass without inference cost.
