# The Human as Root of Trust, Taste, and Value

**Why the most efficient AI pipeline still needs a human at the boundary points.**

---

## The Architecture

The AI agents in REI can calculate, execute, and verify internal consistency. They can run the CARDO GUARD equation. They can route queries, check JSON schemas, and gate on test results. But they cannot do three things that only a human can do.

Aaron is not a redundant executor. He is the Root of Trust, the Calibrator of Values, and the Originator of Paradigms. Here is where his value concentrates:

```
[ HUMAN — ROOT OF TRUST ]
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
Physical   Value    Paradigm
Reality   Weights  Shifts
Anchor    Calibrator Originator
```

---

## 1. The Ground-Truth Alignment Gate

**Also called: The Human Verification Gate**

An AI agent is excellent at checking whether a plan is internally consistent:
- Does this code follow the JSON schema?
- Do the tests pass?
- Is the response format correct?

What the agent *cannot* do is cross the boundary to verify external reality. As defined in `AGENTS.md`:

> *"Only after every claim is confirmed against the original image may the plan be executed. The pipeline cannot detect a hallucination — a fabricated but structurally valid extraction will pass every downstream check. This gate is the only defense."*

**When this matters in REI:**

| Domain | Agent can verify | Only human can verify |
|--------|-----------------|----------------------|
| Genealogy | "Does the birth date follow ISO format?" | "Is this the actual 1846 parish register for William Moore?" |
| Coding | "Does the code match the TypeScript spec?" | "Does this API change break a real user's workflow?" |
| Debate | "Are the arguments logically structured?" | "Is the cited source real or hallucinated?" |
| Industrial | "Is the vibration spike above 3.2σ?" | "Is this sensor correctly calibrated — or is it malfunctioning?" |
| Creative | "Does the narrative follow the blueprint?" | "Does this story actually move a reader?" |

Only the human can look at a raw physical parish scan from 1846 and confirm: "Yes, the ink on this paper matches the claim we just put in the JSON file." The human is the anchor to physical reality.

**Code reference:** The evidence tiering system (`EvidenceCard.jsx`, `parseEvidenceTiers()`) assigns 🟢 Primary Source to claims that have passed human verification. The tier itself is a computational label — but the act of *confirming* the source is human-only.

---

## 2. Calibrating the Value Functions

**Also called: The Subjective Cost Gate**

The CARDO GUARD gate uses a mathematical formula:

```
Expected Miss Loss = Cost of Miss × Calibrated Likelihood
Expected Action Waste = Cost to Act × False Alarm Rate
Verdict = ACT if Miss Loss > Waste
```

The AI can run the math perfectly. What it cannot do is set the values. Those are subjective — they represent what we care about, what we're protecting, and what we're willing to risk.

**Questions only a human can answer:**

| Value Parameter | AI Can Calculate | Human Must Define |
|----------------|-----------------|------------------|
| `costToAct` | "I compute this from the gpt-4o token price" | "How much does a bad routing decision actually cost in cognitive frustration?" |
| `costToMiss` | "I compute this from historical downtime data" | "How much value is lost if we misidentify a cousin in the Family Archive?" |
| `confidence` threshold | "I compute this from catalog match scores" | "When is 72% confidence good enough, and when do we demand 95%?" |
| Escalation cap | "I enforce the 5/session limit" | "Why 5? Why not 3? Why not 10?" |

The human defines what we care about. The AI optimizes within those values. This is not a limitation — it's the correct separation of concerns. Values are human. Optimization is mechanical.

**Code reference:** CARDO GUARD (`cardoGuard.js:93-147`) exposes `costToAct`, `costToMiss`, `falseAlarmRate`, and `confidenceBand` as configurable parameters. The equation is deterministic. The *values* plugged into it are human decisions.

The feedback loop (`src/REI.jsx:handleFeedback()`) is the mechanism by which the human communicates value calibration back to the system. A 👎 on a base-tier response says: "The cost of a miss here is higher than you estimated. Recalibrate." The escalation cap (5/session) is a human-defined value: "I trust the system enough to allow 5 overrides, but not more than that."

---

## 3. Paradigm Shifts vs. Parametric Optimization

**Also called: The Origination Gate**

The AI operates strictly within the paradigm defined by the Master MD — parameter spaces, keyword whitelists, fingerprint catalogs, routing rules. It can iterate within those parameters. It cannot generate a completely new paradigm from its own logic.

**When the human must intervene:**

| Situation | AI Can Do | Human Must Do |
|-----------|----------|---------------|
| **Rule-breaking edge case** | "This input doesn't match any known pattern — routing to default" | "This edge case is so significant that the Jest suite must be rewritten to accommodate it" |
| **Aesthetic judgment** | "The UI passes all lint and test checks" | "This UI works — but it doesn't WOW me. Try again with a different approach" |
| **Temperature tuning** | "I can adjust `temperature` from 0.1 to 0.9" | "Adjusting temperature isn't just a float parameter — it's an aesthetic judgment about the balance of creativity vs precision" |
| **Origination** | "I can improve the existing fingerprint catalog" | "I'm going to add an entirely new domain — industrial telemetry — with its own evidence tiering system and cost model" |
| **Termination** | "I can run indefinitely" | "This experiment has yielded enough data. We're done. Ship it." |

The AI iterates. The human originates. The AI optimizes. The human decides when optimization has reached diminishing returns and it's time to change the game entirely.

**Code reference:** The fingerprint catalog (`fingerprints.json`) is version-controlled data. The AI can suggest new entries. The human decides what ships. The Jest test suite (`routingEval.test.js`) is the human's encoded judgment about what must remain true. The human writes the tests; the AI must satisfy them.

---

## The Architecture, Restated

```
AGENTS (the engine)              HUMAN (the steering vector)
─────────────────────          ─────────────────────────
Calculate                          Define
Execute                            Calibrate
Verify internal consistency         Verify external reality
Optimize within parameters         Originate new parameters
Iterate                            Decide when to stop
Route queries                      Set the value of outcomes
Match fingerprints                 Choose which fingerprints exist
Run tests                          Write what the tests assert
Compute costs                      Define what "cost" means
Scale                             Anchor to physical reality
```

Without the human, the agent loop is high-speed spinning in a closed vacuum — structurally valid, internally consistent, and completely untethered from what matters.

With the human at the three boundary points — physical reality, value calibration, and paradigm origination — the system is not just efficient. It is *grounded*.

---

*"The agents are the engine. The human is the steering vector and the anchor to the physical world."*
