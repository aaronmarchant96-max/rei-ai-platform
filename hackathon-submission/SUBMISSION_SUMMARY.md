# Night Shift Router — Hackathon Submission Summary

**AMD Developer Hackathon: ACT II — Track 1: Hybrid Token-Efficient Routing Agent**

**Pitch:** The cheapest model that still meets the confidence bar.

## What It Does

Night Shift Router is an adaptive inference orchestrator that selects the least expensive reasoning pathway capable of meeting a measurable confidence threshold. It routes queries through a four-tier pathway system:

| Tier | Model | Cost/1K | Use case |
|------|-------|---------|----------|
| Deterministic | None (Layer 0) | $0 | Greetings, smalltalk |
| Cheap | llama-3.1-8b-instant | $0.0001 | Translation, simple queries |
| Medium | llama-3.3-70b-versatile | $0.0014 | Reasoning, coding, genealogy |
| Premium | gpt-4o | $0.0125 | Adversarial, high-stakes |

## Key Results

- **68% cost savings** vs always-premium routing
- **80% routing accuracy** across 57 prompts in 9 categories
- **5 deterministic queries** handled for $0 — the cheapest model is no model
- **9% escalation rate** to premium (only when genuinely needed)
- All routing decisions are **deterministic and testable** — zero inference dependency in the router itself

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full decision flow diagram.

## Demo

```bash
node scripts/demo.mjs
```

One command runs two contrasting prompts: a greeting (deterministic, $0) and an adversarial request (premium, gpt-4o). See [DEMO_OUTPUT.md](./DEMO_OUTPUT.md).

## Benchmarks

```bash
npm test -- --testPathPatterns=routingEval
```

57 prompts with zero inference cost. See [BENCHMARK_RESULTS.md](./BENCHMARK_RESULTS.md).

## Docker

```bash
docker compose up
```

See [README.md](./README.md) for full setup instructions.

## Repo

https://github.com/aaronmarchant96-max/rei-ai-platform
