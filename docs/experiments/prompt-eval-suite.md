# Lab Report: Prompt Evaluation Suite

**Lab:** PromptHound Labs — Applied AI Engineering  
**Date:** 2026-07-03  
**Status:** Complete (v1)

---

## Experiment

A deterministic test harness for domain system prompts and response parsing, designed to catch regressions in prompt structure and output format without requiring live model calls.

## Question

Domain prompts evolve constantly — new instructions, formatting changes, section renames. Every edit risks breaking downstream consumers that depend on a consistent output structure. Can a lightweight, model-free test suite detect prompt regressions before they reach production?

## Hypothesis

A suite of ~20 tests covering prompt content (structure, sections, keywords) and response parser edge cases (format variants, null inputs, special characters) can catch 80%+ of common prompt-breaking changes with zero inference cost and sub-second execution.

## Implementation

Two test categories in `src/__eval__/promptEval.test.js`:

### Prompt content tests (5 tests)
Each domain's system message is verified to contain expected structural elements:
- Assistant welcome copy contains the REI acronym definition (Record, Evaluate, Iterate)
- Coding message mentions both "coding session" and the domain label
- Genealogy message contains domain label and evidence language
- Story message contains narrative-related keywords
- Unknown domain falls back gracefully without crashing

These tests fail when someone edits a system prompt and accidentally removes a critical structural element. The assertions are intentionally broad — they test for presence of expected patterns, not exact string matches — so minor copy edits don't trigger false alarms.

### Response parser tests (17 tests)
`parseAssistantStyleReply` is tested against:
- Full valid responses with all 6 sections (Hinge, Facts, Assumptions, Evaluation, ChangeMind, Move)
- Minimal responses with only Hinge + Move
- Bold-markdown section headers (`**Hinge:** text`)
- Bullet-point content within sections
- Section aliases (`Next move`, `Next step` → Move, `What would change my mind?` → ChangeMind)
- Multi-line content accumulation within a single section
- Empty, null, undefined, and whitespace-only inputs
- Very long input (10,000+ characters)
- Special characters (dollar signs, em dashes, hashtags)
- Lowercase section headers
- Section headers followed by content on the next line (e.g., `"Facts:\n- Point one"`)

## Measurements

| Metric | Value |
|--------|-------|
| Total tests | 22 |
| Prompt content tests | 5 |
| Response parser tests | 17 |
| Execution time | < 500 ms |
| Inference cost | $0.00 |
| Regressions caught during development | 2 (null input crash, section-header-without-inline-content bug) |
| False positives | 0 |

## Results

The hypothesis held. The suite caught two regressions during development that would have reached production:

1. **Null input crash**: `parseAssistantStyleReply(null)` threw `TypeError: Cannot read properties of null` because the default parameter `text = ""` only covers `undefined`, not `null`. Fixed by adding explicit null guard.

2. **Section header without inline content**: Inputs like `"Facts:\n- Point one"` failed to capture "Point one" under the Facts section. The parser matched `"Facts:"` as a section header but required `rest` (content after the colon) to be non-empty before setting `current = key`. Fixed by separating the `current = key` assignment from the `rest` check.

Both bugs were invisible in the live app because LLM outputs almost never produce empty section headers — but they would have surfaced with model version changes or prompt reformatting.

## Limitations

- Tests only cover prompt structure, not prompt quality — a grammatically perfect prompt that produces bad reasoning would pass all checks
- No integration with live model outputs — the parser tests use hand-crafted inputs, not real LLM responses, so edge cases in real model behavior may be missed
- Domain prompt tests are coupled to the current label/description strings — renaming a domain label requires updating tests
- No performance regression detection — slow prompts aren't flagged

## Next Iteration

- Add a "prompt quality" fuzz test that generates variations of each domain prompt and verifies the parser handles them
- Record real LLM responses in CI and add the most common structural variants as new test cases
- Parameterize domain label assertions so renaming a domain doesn't require test edits
- Add a test that each domain prompt, when rendered, produces fewer than N tokens (cost guard)

---

*PromptHound Labs — Applied AI Engineering*  
*"How should AI-assisted work be done well?"*
