# Debate Furnace

> Pressure-test both sides. Find the hinge. Decide what matters.

## CARDO REI Method

Debate Furnace uses the CARDO REI Method to separate what sounds good from what actually holds up.

![Debate Furnace preview](assets/debate-furnace-preview.png)

## About Debate Furnace

Debate Furnace is a structured debate tool for questions that deserve more than a quick yes or no.

The goal is to make both sides clear, show where each one holds up or breaks, and give the decision back to the user.

It is especially useful when the real disagreement is about values, tradeoffs, or what evidence should count.

Not every disagreement needs a winner. Sometimes the useful part is seeing what survived the pressure and what the choice actually depends on.

## Problem / Approach / Result

- **Problem:** Most tools flatten disagreement into a yes/no answer.
- **Approach:** Build a structured debate engine that pressure-tests both sides, flags weak reasoning, and surfaces the decision point through the CARDO REI Method.
- **Result:** A working app with Gemini-backed custom debates, local fallback, share links, history, mobile polish, and copyable reports.
- **Mission:** Help people think more clearly about hard disagreements.

## Live Demo

[Try Debate Furnace](https://debate-furnace-prompthound.vercel.app/)

Story Forge is available from the header in the same live app.

## What It Does

Debate Furnace turns a question into a structured pressure test, shows where each side is strong, shows where each side cracks, and gives the decision back to the user.

It currently supports:

- starter questions with polished topic-specific debate logic
- custom questions routed through Gemini with a local fallback when generation fails
- three debate rounds: Opening Arguments, Rebuttals, and Final Pressure
- judge notes for each round
- final result summary
- key takeaways
- strongest case for each side
- where each side cracked
- unburned claims to verify
- what would change the verdict
- what the choice really depends on
- decision compass values that stay short and readable
- copyable markdown report
- copy individual rounds
- shareable debate links
- debate history saved in localStorage
- mobile-specific layout polish and sticky actions
- footer links to X and GitHub

The current version is a live public prototype with a Gemini-backed custom debate path. Starter questions still use the tuned local debate engine so the app stays fast and stable when you test the most common prompts.

## Story Forge

Story Forge is the companion tool in the same app shell. It turns a curated seed library built from real events, old texts, and strange source material into story blueprints without losing the source trail.

It is built to help with:

- finding the core tension in an event or text
- keeping the original sources visible
- turning source material into usable story hooks
- building around the hinge instead of flattening the material into generic summary
- keeping the source boundary visible so the final output reads as inspiration, not retelling

Two worked examples show the difference between filtering an overclaim and keeping a real unresolved case open:

- [UAP false positive suppression](docs/Debate_Furnace_Rich_Script_Reference.md#false-positive-suppressed-uaps): the analyzer strips out the leap from "unexplained" to "non-human" and leaves the case at "unexplained, not proven."
- [Franklin Expedition residual candidate](docs/Debate_Furnace_Rich_Script_Reference.md#residual-candidate-kept-the-franklin-expedition): the analyzer keeps the uncertainty in play because the historical record still leaves a legitimate gap.

The strongest proof pieces for Story Forge are in the seed library, source trail, and generated packets, with the reusable checklist documented here:

- [Story Forge QA Checklist](docs/story_forge_qa_checklist.md)
- [Story Forge Source Bank](docs/story_forge_source_bank.md)

## CARDO GUARD

CARDO GUARD is the PromptHound Labs launch-gate tool for synthetic decision validation. It takes a scenario, a confidence score, the cost to act, and the cost of missing, then makes the hinge visible before anyone treats the score like a verdict.

It is built to:

- keep the workflow synthetic-first
- compare action waste against miss loss in plain units
- make the recommendation easy to audit
- stay narrow instead of becoming generic AI governance

The reusable launch gate is documented here:

- [CARDO GUARD Launch Gate Checklist](docs/cardo_guard_checklist.md)
- [CARDO GUARD Manual Test Script](docs/cardo_guard_manual_test.md)

## Method

PromptHound Labs turns messy input into reviewable structure. The CARDO REI loop is the shared proof path:

```text
Messy input
Find the pressure point
Separate surface signal from real structure
Produce a reviewable output
Keep human judgment and limits visible
```

Every PromptHound Labs project follows the same proof loop: define the idea, frame the limits, build in small steps, verify the output, manually review the result, commit the evidence, push it publicly, and turn the finished slice into a case study.

## Project Mapping

- Debate Furnace: input is arguments, pressure point is the hinge the disagreement turns on, output is a pressure-tested decision path.
- Story Forge: input is history, myth, archives, and strange sources, pressure point is the core tension inside the source, output is a story blueprint with the source trail kept visible.
- Storm Replay: input is historical storm imagery, pressure point is visual signal versus noise, output is JSONL events, calibration metrics, review notes, and case validation.

## How to Use

1. Open the live app.
2. Pick a starter question or type your own.
3. Optionally enter Side A and Side B positions.
4. Choose the furnace intensity: Balanced, Aggressive, or Ruthless.
5. Click **Ignite Debate**.
6. Step through the rounds.
7. Read the final report and use **Copy Full Report** to save or share it.

Starter questions are the most polished. Custom questions use Gemini when available and fall back to the local engine if generation fails.

## Starter Topics

- ChatGPT vs Grok
- gun control
- love
- AI art
- UAPs
- frontier AI regulation
- remote work
- seed oils
- free will
- free college
- pineapple on pizza
- social media
- money as the root of evil
- cats vs dogs

## Tech Stack

```text
React
Vite
JavaScript
Vercel
GitHub
```

## Current Architecture

```text
React frontend
Vite build
Vercel serverless API route for Gemini
local scripted starter engine
question classifier
topic profiles
hash-based share links
localStorage debate history
structured final report renderer
copyable markdown output
```

Environment variables:

```text
GEMINI_API_KEY=required for custom debates
GEMINI_MODEL=optional, defaults to gemini-2.5-flash-lite
```

## Roadmap

Planned next steps:

```text
more polished topic profiles
optional web search / research mode
citations for researched debates
rate limiting and caching
cleaner mobile polish
shorter share URLs backed by stored debate records
export as image or PDF
```

Longer-term goal:

```text
user question
→ AI debate generator
→ optional web research
→ structured Debate Furnace JSON
→ final pressure-tested report
```

## Reference Docs

The richer script and report language reference, source-bank notes, and product origin notes are archived here:

- [Debate Furnace Rich Script Reference](docs/Debate_Furnace_Rich_Script_Reference.md)
- [The Origin of Debate Furnace](docs/Debate_Furnace_Origin.md)
- [Debate Furnace QA Checklist](docs/debate_furnace_qa_checklist.md)
- [Story Forge QA Checklist](docs/story_forge_qa_checklist.md)
- [CARDO GUARD Launch Gate Checklist](docs/cardo_guard_checklist.md)
- [CARDO GUARD Manual Test Script](docs/cardo_guard_manual_test.md)

## Local Setup

```bash
npm install
npm run dev
```

```bash
npm test
```

## Build

```bash
npm run build
```

## Vercel Settings

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: ./
```

## Status

Debate Furnace is a working public prototype with a live Gemini path for custom debates, saved history, and share links. The current goal is to keep tightening the prompt quality, improve profile coverage, and turn the strongest user patterns into stable product features.
