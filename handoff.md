Goal:
Fully migrate Hinge AI to REI.AI with custom chatbot layout, optimize model routing, and set up GPT/OSS hybrid profiles.

> **For next session:** Start with `CLI_ENTRY.md` instead of this file. It's optimized for token efficiency.

Confirmed:

- REI.AI is deployed with the new chatbot UI at https://debate-furnace.vercel.app/#rei.
- Legacy #cfai hash is automatically re-routed to #rei in src/AppShell.jsx.
- Backend Vercel API routing relocated to standard api/cfai.js.
- Added dynamic model selection routing based on input constraints.
- Added GPT (OpenAI) and OSS (Groq) routing profiles with key checks.
- Cleaned duplicate Jest configuration files (.babelrc, jest.config.js). Test suite runs cleanly.

Unknowns:

- Whether the user has OPENAI_API_KEY configured in Vercel to fully utilize the live GPT Mode.

Files:

- src/REI.jsx (Vite frontend chat component)
- api/cfai.js (Vercel serverless backend router)
- src/AppShell.jsx (Main routing context)

Next step:
Review live performance and refine system prompt profiles if requested.

Do not:

- Do not bring back the legacy Hinge AI tab.
- Do not use Next.js App Router exports in /api/ (must remain default handler).
