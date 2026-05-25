# Debate Furnace

> Pressure-test both sides. Find the hinge. Decide what matters.

![Debate Furnace preview](assets/debate-furnace-preview.png)

## About Debate Furnace

Debate Furnace slows arguments down. It pressure-tests both sides, exposes the real hinge, and shows what the decision actually depends on.

The goal is not fake neutrality or a louder answer. It is to make the strongest version of each side visible, reveal where each side holds up or breaks, and give the decision back to the user.

Many arguments are not simple yes or no questions. They are collisions between safety and freedom, fairness and responsibility, truth and uncertainty, progress and risk. Debate Furnace is built to make that structure visible.

Not every disagreement needs a winner. Sometimes the real value is seeing what the argument actually depends on.

## Problem / Approach / Result

- **Problem:** Most tools flatten disagreement into a yes/no answer.
- **Approach:** Build a structured debate engine that pressure-tests both sides, scores rounds, surfaces the hinge, and gives the decision back to the user.
- **Result:** A working app with Gemini-backed custom debates, local fallback, share links, history, mobile polish, and copyable reports.

## Live Demo

Live Vercel deployment: https://debate-furnace-prompthound.vercel.app/

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

The richer script and report language reference is archived here:

- [Debate Furnace Rich Script Reference](docs/Debate_Furnace_Rich_Script_Reference.md)

## Local Setup

```bash
npm install
npm run dev
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
