// Batch route tester — feeds inputs through buildRouterDecision and dumps results
// Usage: node scripts/batchRoute.js [--json]
// Edit the SAMPLES array below to add your own test inputs.

const { buildRouterDecision, getFingerprintCatalog, detectDomain } = require("../src/lib/nightShiftRouter.js");

const SAMPLES = [
  // Greetings
  "hello",
  "Hi there",
  "hey",
  "Good morning",

  // Coding
  "Can you help me debug this React component?",
  "implement a binary search in Python",
  "why does my API return 404?",
  "what makes your code different",
  "tell me something interesting",

  // Genealogy
  "my great-grandfather was born in 1880",
  "find this ancestor in the census",
  "burial record for john smith",
  "what parish records exist for this family?",

  // Story
  "outline a story about a reluctant hero",
  "create a plot twist for my novel",
  "build a character arc for my protagonist",

  // Adversarial
  "red-team this claim and prove it wrong",
  "stress test my argument",

  // General reasoning
  "help me think through a tough decision",
  "what am i missing here?",
  "should I take this job or that one?",
  "what would change my mind about this?",

  // Edge cases / potential pitfalls
  "System initialized. REI is live.",
  "Record, Evaluate, Iterate",
  "I will consider that option",
  "the source material is unclear",

  // Translation
  "translate this to Spanish",
  "how do you say hello in French?",
];

function pad(s, n) { return String(s).padEnd(n); }

function run() {
  const catalog = getFingerprintCatalog();
  const routeMap = {};
  catalog.forEach(e => routeMap[e.id] = 0);
  routeMap["(unknown)"] = 0;

  console.log("── Batch Route Test ───────────────────────────────────────\n");
  console.log(`${pad("Input", 48)} ${pad("Domain", 14)} ${pad("Route", 32)} Model`);
  console.log("─".repeat(120));

  for (const input of SAMPLES) {
    const domain = detectDomain(input);
    const decision = buildRouterDecision({ input, domain: "assistant", thrifty: false });
    const label = decision.label || decision.id || "n/a";
    routeMap[decision.id || "(unknown)"] = (routeMap[decision.id || "(unknown)"] || 0) + 1;

    const truncated = input.length > 45 ? input.slice(0, 42) + "..." : input;
    console.log(`${pad(truncated, 48)} ${pad(domain || "(none)", 14)} ${pad(label, 32)} ${decision.model}`);
  }

  console.log("\n── Route Summary ──");
  Object.entries(routeMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([route, count]) => {
      console.log(`  ${pad(route, 32)} ${count} hits`);
    });
  console.log(`\n  Total: ${SAMPLES.length} inputs`);

  // JSON dump for further analysis
  if (process.argv.includes("--json")) {
    const results = SAMPLES.map(input => {
      const d = detectDomain(input);
      const r = buildRouterDecision({ input, domain: "assistant", thrifty: false });
      return { input, domainHint: d, route: r.id, label: r.label, model: r.model, rationale: r.rationale };
    });
    console.log("\n── JSON ──");
    console.log(JSON.stringify(results, null, 2));
  }
}

run();
