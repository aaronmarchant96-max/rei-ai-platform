import { useEffect, useState } from "react";

const T = {
  bg: "#080810",
  surface: "#0f0f1a",
  card: "#13131f",
  border: "#1e2235",
  ember: "#e8742a",
  brass: "#b8943a",
  gold: "#d4a83a",
  molten: "#f05020",
  charcoal: "#1a1a28",
  sideA: "#5b8dd9",
  sideB: "#c85858",
  smoke: "#f0a030",
  judge: "#4aaa70",
  muted: "#4a5068",
  text: "#d8dce8",
  textDim: "#7a8098",
  warn: "#e05050"
};

const STARTERS = [
  "Is ChatGPT better than Grok?",
  "Does gun control reduce harm?",
  "Is love real?",
  "Is AI art real art?",
  "Are UAPs most likely advanced non-human technology?",
  "Should governments regulate frontier AI more aggressively?"
];

const HEAT = {
  low: ["Low Heat", "Clean disagreement", T.sideA],
  medium: ["Medium Heat", "Contested assumptions", T.gold],
  high: ["High Heat", "Heavy flaws or unresolved claims", T.ember],
  critical: ["Critical Heat", "Core issue unresolved under pressure", T.sideB]
};

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 720);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function titleCase(value) {
  if (!value) return "";
  if (["yes", "no"].includes(value.toLowerCase().trim())) return value.trim().toUpperCase();
  return value
    .trim()
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function cleanQuestion(q) {
  return q.trim().replace(/\s+/g, " ");
}

function classify(question) {
  const l = question.toLowerCase();
  if (["uap", "ufo", "alien", "non-human", "non human", "unidentified anomalous"].some((x) => l.includes(x))) return "extraordinary";
  if ((l.includes("better than") || l.includes(" vs ") || l.includes("versus")) && !l.includes("gun")) return "product";
  if (["love", "real art", "ai art", "free will", "consciousness", "authentic", "meaning"].some((x) => l.includes(x))) return "moral";
  if (["gun", "regulate", "ban", "tax", "law", "government", "policy", "schools", "should "].some((x) => l.includes(x))) return "policy";
  if (["causes", "proven", "evidence", "climate", "vaccine", "study", "studies", "scientific"].some((x) => l.includes(x))) return "factual";
  return "open";
}

function inferSides(question, type) {
  const l = question.toLowerCase();
  if (type === "moral" && l.includes("love")) return ["Love is real", "Love is not real"];
  if (type === "moral" && l.includes("art")) return ["AI art is real art", "AI art is not real art"];
  if (type === "product" && (l.includes("chatgpt") || l.includes("grok"))) return ["ChatGPT is better than Grok", "Grok is better than ChatGPT"];
  if (type === "extraordinary") return ["UAPs are most likely advanced non-human technology", "Conventional explanations are more likely"];
  if (type === "policy" && l.includes("gun")) return ["Gun control reduces harm", "Gun control does not reduce harm enough to justify the tradeoffs"];
  if (type === "policy" && l.includes("ai")) return ["Governments should regulate frontier AI more aggressively", "Aggressive AI regulation would cause more harm than good"];
  return ["Yes", "No"];
}

function shortLabel(side) {
  const l = side.toLowerCase().trim();
  if (l === "yes") return "YES";
  if (l === "no") return "NO";
  if (l.startsWith("chatgpt")) return "ChatGPT";
  if (l.startsWith("grok")) return "Grok";
  if (l.startsWith("love is real")) return "Love Is Real";
  if (l.startsWith("love is not")) return "Love Isn't Real";
  if (l.includes("ai art is real")) return "Real Art";
  if (l.includes("ai art is not")) return "Not Real Art";
  if (l.includes("non-human")) return "Non-Human Tech";
  if (l.includes("conventional")) return "Conventional";
  if (l.includes("gun control reduces")) return "Reduces Harm";
  if (l.includes("does not reduce")) return "Tradeoff Skeptic";
  const words = side.trim().split(/\s+/).slice(0, 3).join(" ");
  return titleCase(words || "Side");
}

function genericProfile(question, a, b) {
  const A = shortLabel(a);
  const B = shortLabel(b);
  return {
    label: "Open Argument Test",
    icon: "🔥",
    criteria: ["exact claim", "definitions", "evidence", "counterexamples", "tradeoffs", "what would change the verdict"],
    desc: `This debate is asking whether the exact claim — “${question}” — survives pressure. The sides should not drift into slogans. They need to define the claim, name what proof would be enough, answer the strongest objection, and explain what would change the verdict.`,
    rounds: [
      [
        `${A}'s strongest opening is not simply to say yes. It has to defend the exact claim in the question and show why that claim is more than an instinct or preference. A serious version gives a clear definition, names the evidence or lived examples that support it, and explains why the opposing side's doubts do not defeat the core point. The strongest version also admits where the claim is uncertain instead of pretending the debate is already settled.`,
        `${B}'s strongest opening is not simply to say no. It has to show why the claim has not met the standard it needs to meet. A serious version identifies the missing proof, tests the definitions, and asks whether alternative explanations fit the facts better. The strongest version does not dismiss the question; it shows why the burden has not been carried yet.`
      ],
      [
        `${A}'s rebuttal should press the difference between uncertainty and defeat. A claim can have fuzzy edges and still point to something real, useful, or true enough to act on. The key move is to show that the opponent is demanding an impossible standard or ignoring the best evidence that actually exists. If ${A} cannot do that, the argument collapses into confidence without proof.`,
        `${B}'s rebuttal should press the difference between plausibility and proof. A claim can sound reasonable and still be under-supported. The key move is to show that ${A} has not ruled out simpler explanations, weaker definitions, or important counterexamples. If ${B} cannot do that, the argument becomes skepticism for its own sake.`
      ],
      [
        `${A}'s final pressure point is that the claim does not need perfection to survive. It needs a better account of the question than the alternative. If the evidence, definitions, and examples all point in the same direction, then the claim deserves weight even if some uncertainty remains. The final question is whether the unresolved doubts are strong enough to overturn the central case.`,
        `${B}'s final pressure point is that unresolved doubts are not a side issue; they may be the whole debate. If the key terms are undefined, the evidence is thin, or the examples do not generalize, then the honest answer may be that the claim has not survived yet. The final question is whether ${A} has proven the claim, or only made it sound attractive.`
      ]
    ],
    take: [
      ["The exact claim matters", "A side should not win by defending a safer or vaguer version of the question."],
      ["Definitions do real work", "If the key terms are not clear, both sides may be arguing past each other."],
      ["Uncertainty is not a verdict by itself", "The question is whether the unresolved doubts are strong enough to change the outcome."]
    ],
    strongA: `${A}'s strongest case is that the claim can be made precise enough to test and still survives the strongest objections.`,
    strongB: `${B}'s strongest case is that the claim has not met the standard needed to treat it as settled.`,
    crackA: `${A} cracks if it relies on confidence, intuition, or broad examples without proving the exact claim.`,
    crackB: `${B} cracks if it treats uncertainty as automatic defeat instead of engaging the best version of the claim.`,
    verify: [
      `The exact definition being used for “${question}.”`,
      "Any factual claims or examples used to support either side.",
      "Whether the sides are defending the original claim or a safer nearby claim.",
      "What evidence would actually be enough to change the verdict.",
      "Whether the strongest counterexample has been answered or avoided."
    ],
    changeA: [
      "A sharper definition of the central claim.",
      "Concrete evidence or examples that directly support the exact question.",
      "A direct answer to the strongest counterexample."
    ],
    changeB: [
      "A clearer standard of proof that does not make the question impossible to answer.",
      "A better alternative explanation or counterexample.",
      "Evidence that the pro side is defending a weaker version of the claim."
    ],
    core: `The heat point is whether “${question}” has been defended as written, or whether the debate drifted into easier claims nearby.`,
    comp: [
      "the best direct case for the exact claim",
      "the missing proof and unresolved counterexamples",
      "whether the original question survived, not just a weaker version of it"
    ]
  };
}

function profile(question, type, a, b) {
  const l = question.toLowerCase();
  if (type === "product" && l.includes("grok")) return {
    label: "Product Comparison",
    icon: "🔧",
    criteria: ["better for what", "writing", "coding", "current events", "accuracy risk", "tone", "ecosystem"],
    desc: `This is a product comparison. The real question is not which model is universally better. The real question is which tool is better for the user's actual use case: structured work, coding, current events, speed, tone, or reliability.`,
    rounds: [
      [
        "ChatGPT's strongest case is consistency across serious everyday work. For structured writing, coding help, document review, debugging, and planning, it usually gives cleaner formatting and more reliable follow-through. Its advantage is not that it is always smarter than Grok. The advantage is that it behaves more like a dependable general-purpose work tool. If better means the tool most users can trust for professional output, ChatGPT has the stronger default case.",
        "Grok's strongest case is immediacy and personality. It is built around current events, internet culture, X integration, and direct engagement. For users who care about what is happening right now, Grok has an advantage ChatGPT cannot fully copy without live context. It also feels less filtered and more willing to answer in a sharp, conversational style. If better means fast, current, and direct, Grok has a real case."
      ],
      [
        "The live-context advantage is real, but it comes with a cost. The more a model leans on current internet material, the more it risks repeating noise, rumors, and confident mistakes. For professional work, being slightly slower but more structured is often better than being fast and wrong. ChatGPT's caution can be annoying, but in coding, writing, and analysis, caution often protects the output. Grok needs to show its speed does not come at the expense of reliability.",
        "Calling ChatGPT cautious does not automatically make it reliable. Many users experience that caution as friction: hedges, disclaimers, and long setups before the answer. A tool that gives a polished memo when the user wanted a direct answer is not always better. Grok's directness is useful for people who already know how to evaluate information. ChatGPT also hallucinates; it often just does it in a cleaner voice."
      ],
      [
        "The best final case for ChatGPT is that it is the safer default for most work. It may not be the funniest or fastest model, but it is strong across writing, coding, reasoning, and structured assistance. That breadth matters. When the user's goal is to get reliable output they can edit, ship, or build from, ChatGPT remains the stronger general-purpose tool.",
        "The best final case for Grok is that 'most users' is not the same as 'office workers writing formal documents.' Plenty of users care about current events, social context, humor, and direct answers more than polished structure. Grok does not need to beat ChatGPT at every task. It only needs to show that for a large class of real users, its speed, tone, and live awareness matter more."
      ]
    ],
    take: [
      ["Better needs a job", "The comparison only resolves when the use case is named."],
      ["Live context cuts both ways", "Current information is useful, but it also raises the risk of confident errors."],
      ["Tone is a feature", "Directness, humor, and friction matter to real users." ]
    ],
    strongA: "ChatGPT's strongest case is reliability across structured work: writing, coding, planning, document review, and professional output.",
    strongB: "Grok's strongest case is live context and directness: current events, internet culture, X integration, humor, and less-filtered engagement.",
    crackA: "ChatGPT cracks when its caution becomes friction. A careful answer is not always a useful answer.",
    crackB: "Grok cracks on accuracy risk. Real-time awareness is only an advantage if the synthesis is dependable.",
    verify: ["Current feature access for both tools.", "Independent benchmark comparisons.", "Error rates on recent-events questions.", "Pricing and tier limits.", "How much value X integration adds outside the X ecosystem."],
    changeA: ["Controlled writing and coding comparisons.", "Reliability data across repeated prompts.", "Evidence that most users need structured professional output."],
    changeB: ["Evidence Grok's live answers are accurate at scale.", "User data showing current events dominate daily use.", "A directness-versus-error-risk comparison."],
    core: "Neither side wins until better means something specific.",
    comp: ["consistent work output, coding help, and professional reliability", "real-time awareness, personality, and direct answers", "what you need the tool to do this week"]
  };

  if (type === "moral" && l.includes("love")) return {
    label: "Moral / Philosophical",
    icon: "🧠",
    criteria: ["definitions", "lived experience", "biology", "culture", "what counts as real"],
    desc: "This is a philosophical question about whether love is real. The debate turns on what real means: biologically measurable, subjectively experienced, socially constructed, or independently existing.",
    rounds: [
      ["Love is real if real includes inner experience that changes behavior. Pain, grief, joy, and fear cannot be picked up and weighed, but they are not fake. Love changes decisions, bonds people, shapes memory, and has biological patterns behind it. The strongest version of this case does not pretend love is a physical object. It argues that inner experiences can be real in the way human life actually uses the word real.", "Love may be a label for attachment, desire, dependency, habit, loyalty, and social pressure. People clearly feel powerful things, but that does not prove those feelings form one coherent thing called love. What someone calls love at 19 may look nothing like what they call love at 45. Different cultures may divide the same feelings into duty, family bond, attraction, or obligation. The question is whether love is a real thing, or a useful human category."],
      ["The label objection proves too much. Friendship, justice, beauty, grief, and language are also human categories, but we do not treat them as fake just because they are conceptual. If love is a stable pattern of feeling, behavior, attachment, and commitment, then calling it a category does not make it unreal. The opposing side needs to explain why love is uniquely fake while other inner states remain real. Otherwise the argument collapses into saying only physical objects count.", "Consequence is not the same as reality. Hallucinations, phobias, and false beliefs can shape behavior too, but that does not make their content real. The pro side needs a sharper line than 'people feel it and act on it.' It also needs to handle the fact that love is used for romance, family, friendship, pets, ideals, and even objects. A concept that stretches that far may be too vague to prove as one thing."],
      ["Love is not real like a rock. It is real like grief, meaning, fear, or loyalty. Its edges are fuzzy, but the center does not disappear. The fact that biology participates in love does not explain it away; biology is how human experience happens. If subjective experience can be real at all, love clears that bar.", "The honest final position is that people feel powerful things and call some of them love. Whether that label names a real thing depends entirely on the definition of real. The pro side made love meaningful and consequential, but not necessarily real in a stronger sense. If the question requires more than intensity, biology, and social recognition, the verdict remains unresolved."]
    ],
    take: [["The debate is about real", "Both sides agree people feel something. They disagree about what kind of thing it is."], ["Neurochemistry does not settle it", "Biology can describe love without explaining it away."], ["Fuzzy edges do not erase the center", "Many meaningful concepts are hard to define at the edges."]],
    strongA: "Love Is Real's strongest case is that subjective experiences can be real when they are stable, consequential, biologically grounded, and recognizable across human life.",
    strongB: "Love Isn't Real's strongest case is that love may be a broad label placed on several different feelings rather than one coherent thing.",
    crackA: "Love Is Real cracks when consequence is treated as proof. Consequential experiences can still be mistaken or miscategorized.",
    crackB: "Love Isn't Real cracks when the label argument proves too much. Many real human concepts are labels for clusters of experience.",
    verify: ["Claims that love is only chemistry.", "Claims that love is cross-cultural.", "Claims that love is socially constructed.", "The definition of real used by each side.", "Whether neurochemistry explains love away or describes how it works."],
    changeA: ["A definition of real that includes subjective experience.", "Cross-cultural evidence that love appears as a stable pattern.", "Evidence love is not reducible to chemistry alone."],
    changeB: ["A stricter definition of real that does not exclude pain or grief.", "Evidence love means radically different things across cultures.", "A stronger boundary argument against fuzzy categories."],
    core: "The unresolved question is what real means. Until both sides agree on that definition, they answer different questions with the same word.",
    comp: ["subjective experience, biology, and behavior", "a stricter definition of reality than felt intensity", "which definition of real you find most honest"]
  };

  if (type === "extraordinary") return {
    label: "Extraordinary Claim",
    icon: "🛸",
    criteria: ["evidence quality", "alternative explanations", "source reliability", "sensor data", "what proof would be enough"],
    desc: "This debate asks whether UAPs are most likely advanced non-human technology. The question should be taken seriously without treating the extraordinary claim as proven.",
    rounds: [
      ["The strongest case is not certainty. It is that some cases involve trained observers, multiple sensors, and behavior that does not fit known public platforms. Official acknowledgment matters because it moves the topic out of pure rumor and into documented anomaly. The pro side does not need to claim every sighting is exotic. It needs to show that the strongest remaining cases are better explained by something beyond known human systems.", "Unexplained does not mean non-human. Sensor error, misidentification, classified platforms, drones, and incomplete data remain more likely before the evidence is strong enough to move the needle. The strongest skeptical case takes the reports seriously without jumping to origin. The burden is not to explain every case from the couch. The burden is on the extraordinary claim to show why conventional categories are not enough."],
      ["Conventional explanations cannot just be asserted like a magic eraser. If a case includes multiple sensors, trained observers, and investigation without resolution, the skeptical side has to do more than list possible mundane causes. Possibility is not explanation. The question is whether those causes were actually tested and failed in the strongest cases. If they were, the prior should update.", "Most public cases do not give us enough raw data to rule out conventional explanations. We often lack calibration records, sensor metadata, full context, and chain of custody. That matters. A case can stay unexplained because it is extraordinary, or because the data is too incomplete to explain rigorously. The pro side is treating a gap in public explanation as stronger than it is."],
      ["Some cases remain genuinely anomalous, and that matters. If the best cases have survived normal explanation attempts, then non-human technology should remain on the table. The skeptic cannot win by saying 'maybe classified' forever, because that becomes its own extraordinary claim after enough time. The final issue is whether the strongest cases are merely unknown, or whether they point toward technology outside known human capability.", "The honest position is that anomalies are real, but the evidence is not strong enough to make non-human technology the most likely answer. The phrase 'most likely' is doing the hard work. A claim can be possible, worth investigating, and still not be the best explanation yet. Until raw data, independent review, and conventional exclusions are clearer, the skeptical position survives." ]
    ],
    take: [["Unexplained is not non-human", "An anomaly can be real without its origin being settled."], ["Official acknowledgment raises the question", "It does not answer the question."], ["The proof standard matters", "Neither side fully defined what would settle it."]],
    strongA: "Non-Human Tech's strongest case is the subset of multi-sensor, multi-observer cases that remain unresolved after official attention.",
    strongB: "Conventional's strongest case is the gap between unexplained and most likely non-human.",
    crackA: "Non-Human Tech cracks when it treats missing public explanation as proof of exotic origin.",
    crackB: "Conventional cracks when it lists possible explanations without showing they actually fit the strongest cases.",
    verify: ["What multi-sensor means in each case.", "Whether conventional explanations were tested and failed.", "Raw sensor data, calibration, and chain of custody.", "AARO findings and public conclusions."],
    changeA: ["Clear multi-sensor data with verified calibration.", "Independent review with chain of custody.", "Conventional explanations tested and eliminated."],
    changeB: ["A confirmed mundane explanation for the strongest cases.", "Raw data showing sensor error or misread performance.", "A transparent investigation methodology."],
    core: "The unresolved question is whether remaining cases exceed known human capability, or whether the evidence is too incomplete for an extraordinary conclusion.",
    comp: ["documented anomalies not fully explained", "the rule that unexplained is not non-human", "what proof would actually be enough"]
  };

  if (type === "policy" && l.includes("gun")) return {
    label: "Policy Debate",
    icon: "⚖",
    criteria: ["public safety", "rights", "enforcement", "self-defence", "illegal markets", "evidence"],
    desc: "This is a policy debate about firearm harm and tradeoffs. It should stay specific to public safety, enforcement, self-defence, illegal markets, and civil liberties.",
    rounds: [["Gun control can reduce harm when it targets known risk points: background checks, domestic violence restrictions, permit-to-purchase, safe storage, and red flag laws with due process. The strongest version is not 'ban everything.' It is targeted risk reduction. Firearm suicide, domestic violence, and impulsive violence are areas where access matters. A policy does not need to eliminate all harm to reduce meaningful harm.", "Gun control can fail by burdening lawful owners while illegal markets and criminal intent remain. Rural self-defence, delayed police response, and civil liberties are not side issues. The strongest skeptical case is not that every regulation is evil. It is that each restriction must prove it reduces harm enough to justify enforcement costs and rights tradeoffs."], ["The illegal market objection does not apply equally to every measure. Safe storage and domestic violence restrictions target risk moments, not only criminal supply. Background checks and permit systems can reduce legal leakage into dangerous hands. The skeptical side needs to distinguish weak proposals from stronger ones instead of treating gun control as one big category.", "International examples are not plug-and-play. The United States has a massive existing gun supply, different legal constraints, and enforcement challenges. A policy that worked elsewhere may not scale cleanly. The pro side needs to show which specific policy works under local conditions, not just that other countries have lower gun deaths."], ["The best case is targeted measures with evidence and guardrails. Permit-to-purchase, domestic violence restrictions, safe storage, and properly designed red flag laws are the strongest ground. The goal is not symbolic control. The goal is fewer deaths while preserving due process and legitimate ownership.", "The best skeptical case is requiring each measure to prove itself. Some laws may reduce harm; others may be symbolic or poorly enforced. A serious policy debate should separate background checks from assault weapon bans from storage laws from red flag laws. The tradeoffs are not identical." ]],
    take: [["Specific measures matter", "Gun control is not one policy."], ["Self-defence and harm reduction both matter", "The strongest arguments acknowledge the other side's concern."], ["Evidence must fit context", "International comparisons need care."]],
    strongA: "Reduces Harm's strongest case is targeted access control at known risk points.",
    strongB: "Tradeoff Skeptic's strongest case is that enforcement burden, rights costs, and illegal market substitution vary by policy.",
    crackA: "Reduces Harm cracks when international comparisons ignore local starting conditions.",
    crackB: "Tradeoff Skeptic cracks when skepticism becomes categorical opposition to every specific measure.",
    verify: ["Permit-to-purchase outcomes by state.", "Red flag law effects on suicide and homicide.", "Illegal firearm sourcing data.", "Domestic violence and firearm access studies."],
    changeA: ["State-level evidence that specific measures reduce deaths.", "Proof substitution does not erase benefits.", "Strong due-process protections."],
    changeB: ["Evidence stricter laws fail to reduce overall harm.", "Data showing substitution offsets restrictions.", "Evidence enforcement burdens outweigh benefits."],
    core: "The dispute is which specific firearm measures reduce harm enough to justify their tradeoffs.",
    comp: ["preventing firearm deaths through targeted access rules", "protecting self-defence, legal ownership, and enforcement fairness", "which policies have clean enough evidence"]
  };

  return genericProfile(question, a, b);
}

function scoreRound(type, question, i, intensity) {
  let a = 8.0;
  let b = 8.0;
  const l = question.toLowerCase();
  if (type === "product") { if (i < 2) a += 0.35; else b += 0.35; }
  if (type === "moral" && l.includes("love")) { if (i === 0) a += 0.25; if (i === 1) a += 0.15; if (i === 2) b += 0.15; }
  if (type === "extraordinary") { if (i === 0) a += 0.15; if (i === 1 || i === 2) b += 0.3; }
  if (type === "policy" && l.includes("gun")) { if (i === 0) a += 0.2; if (i === 1) b += 0.2; if (i === 2) return [8.2, 8.2]; }
  if (type === "open") { if (i === 0) a += 0.1; if (i === 1) b += 0.1; }
  if (intensity === "ruthless") { a += 0.05; b += 0.05; }
  return [Number(a.toFixed(1)), Number(b.toFixed(1))];
}

function judge(winner, round, data) {
  if (winner === "TIE") return "Both sides hit the real hinge. Neither gained a clean edge because the unresolved definition, evidence standard, or counterexample still controls the debate.";
  const w = winner === "A" ? data.shortA : data.shortB;
  const l = winner === "A" ? data.shortB : data.shortA;
  if (data.qType === "product") return `${w} takes the round because it tied the argument to concrete user needs. ${l} made a real point, but left the tradeoff less resolved.`;
  if (data.qType === "moral") return `${w} takes the round by controlling the definition more clearly. ${l} raised a serious challenge, but did not fully close the gap.`;
  if (data.qType === "extraordinary") return `${w} takes the round by handling the burden of proof more carefully. ${l} had a plausible frame, but pushed further than the evidence safely allowed.`;
  return `${w} takes the round because it stayed closer to the exact claim. ${l} made a valid objection, but left the harder question unresolved.`;
}

function generate(questionRaw, sideARaw, sideBRaw, intensity) {
  const question = cleanQuestion(questionRaw);
  const qType = classify(question);
  const inferred = inferSides(question, qType);
  const sideA = sideARaw.trim() || inferred[0];
  const sideB = sideBRaw.trim() || inferred[1];
  const shortA = shortLabel(sideA);
  const shortB = shortLabel(sideB);
  const p = profile(question, qType, sideA, sideB);
  const shell = { qType, sideA, sideB, shortA, shortB };
  const rounds = p.rounds.map((pair, i) => {
    const [sa, sb] = scoreRound(qType, question, i, intensity);
    const winner = Math.abs(sa - sb) < 0.2 ? "TIE" : sa > sb ? "A" : "B";
    return {
      round: i + 1,
      label: ["Opening Arguments", "Rebuttals", "Final Pressure"][i],
      aArg: pair[0],
      bArg: pair[1],
      sa,
      sb,
      winner,
      judgeNote: judge(winner, i, { ...shell, qType }),
      roundHeat: winner === "TIE" ? "medium" : "low"
    };
  });
  const aWins = rounds.filter((r) => r.winner === "A").length;
  const bWins = rounds.filter((r) => r.winner === "B").length;
  const ties = rounds.filter((r) => r.winner === "TIE").length;
  const contested = (aWins > bWins && rounds[2].winner === "B") || (bWins > aWins && rounds[2].winner === "A");
  const heatLevel = contested ? "critical" : ties > 0 ? "medium" : qType === "extraordinary" || (qType === "moral" && intensity === "ruthless") ? "high" : "medium";
  return { ...p, qType, sideA, sideB, shortA, shortB, rounds, aWins, bWins, ties, matchWinner: contested ? "CONTESTED" : aWins > bWins ? "A" : bWins > aWins ? "B" : "TIE", heatLevel, intensity };
}

function Pill({ children, color }) {
  return <span style={{ background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 12, padding: "2px 10px", fontSize: 11, color, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
}

function Section({ title, color, children }) {
  return <div style={{ background: T.card, border: `1px solid ${T.border}`, borderTop: `3px solid ${color}`, borderRadius: 12, padding: 18, marginBottom: 12 }}><div style={{ fontSize: 10, letterSpacing: 3, color, fontWeight: 800, marginBottom: 12 }}>{title}</div>{children}</div>;
}

function Card({ title, color, children }) {
  return <div style={{ background: T.card, border: `1px solid ${color}24`, borderTop: `3px solid ${color}66`, borderRadius: 12, padding: 16 }}><div style={{ fontSize: 10, letterSpacing: 2, color, fontWeight: 800, marginBottom: 8 }}>{title}</div><p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.75, margin: 0 }}>{children}</p></div>;
}

function Score({ label, score, color }) {
  return <div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}><span style={{ fontSize: 12, color: T.muted, fontWeight: 700 }}>{label}</span><b style={{ fontSize: 24, color }}>{score.toFixed(1)}</b></div><div style={{ height: 4, background: T.border, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${score * 10}%`, background: color }} /></div></div>;
}

export default function DebateFurnace() {
  const mobile = useMobile();
  const [question, setQuestion] = useState("");
  const [sideA, setSideA] = useState("");
  const [sideB, setSideB] = useState("");
  const [intensity, setIntensity] = useState("balanced");
  const [debate, setDebate] = useState(null);
  const [round, setRound] = useState(0);
  const [analysis, setAnalysis] = useState(false);
  const [final, setFinal] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const grid = { display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 };
  const colors = { balanced: T.sideA, aggressive: T.gold, ruthless: T.molten };

  const start = () => {
    if (!question.trim()) return;
    setDebate(generate(question, sideA, sideB, intensity));
    setRound(0);
    setFinal(false);
    setOpen(false);
    setAnalysis(true);
  };
  const reset = () => { setDebate(null); setSideA(""); setSideB(""); setFinal(false); setAnalysis(false); setRound(0); };
  const stoke = () => { setAnalysis(false); round < 2 ? setRound(round + 1) : setFinal(true); };
  const copy = () => {
    if (!debate) return;
    const result = debate.matchWinner === "CONTESTED" ? "Contested Result" : debate.matchWinner === "TIE" ? "Split Decision" : `${debate.matchWinner === "A" ? debate.shortA : debate.shortB} Survived Stronger`;
    const label = debate.label === "Moral / Philosophical" ? "Unburned Claims to Verify or Clarify" : "Unburned Claims to Verify";
    const md = `# Debate Furnace — Final Report\n\n**Question:** ${question}\n**Type:** ${debate.label}\n**Result:** ${result}\n**Score:** ${debate.shortA}: ${debate.aWins} | ${debate.shortB}: ${debate.bWins}${debate.ties ? ` | ${debate.ties} tie` : ""}\n\n## What the Question Was Really Asking\n${debate.desc}\n\n## Key Takeaways\n${debate.take.map(([t, b]) => `- **${t}:** ${b}`).join("\n")}\n\n## Strongest Cases\n- **${debate.shortA}:** ${debate.strongA}\n- **${debate.shortB}:** ${debate.strongB}\n\n## Where Each Side Cracked\n- **${debate.shortA}:** ${debate.crackA}\n- **${debate.shortB}:** ${debate.crackB}\n\n## ${label}\n${debate.verify.map((v) => `- ${v}`).join("\n")}\n\n## What Would Change the Verdict?\n### Make ${debate.shortA} stronger\n${debate.changeA.map((v) => `- ${v}`).join("\n")}\n\n### Make ${debate.shortB} stronger\n${debate.changeB.map((v) => `- ${v}`).join("\n")}\n\n## Core Heat Point\n${debate.core}\n\n## Decision Compass\n- If you prioritize **${debate.comp[0]}**, ${debate.shortA} feels stronger.\n- If you prioritize **${debate.comp[1]}**, ${debate.shortB} feels stronger.\n- Unresolved: ${debate.comp[2]}.\n\n## Transcript\n${debate.rounds.map((r) => `### Round ${r.round} — ${r.label}\n**${debate.shortA}:** ${r.aArg}\n\n**${debate.shortB}:** ${r.bArg}\n\n**Judge:** ${r.judgeNote}`).join("\n\n")}\n\n---\n*We do not give you the answer. We show you what survived the heat.*`;
    navigator.clipboard.writeText(md).finally(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  if (!debate) return <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", color: T.text, padding: mobile ? "24px 12px" : "36px 20px 60px" }}><div style={{ maxWidth: 680, margin: "0 auto" }}><div style={{ textAlign: "center", marginBottom: 32 }}><div style={{ fontSize: 10, letterSpacing: 7, color: T.brass, fontWeight: 800, marginBottom: 14 }}>DEBATE FURNACE</div><h1 style={{ fontSize: mobile ? 34 : 46, fontWeight: 900, margin: "0 0 14px", letterSpacing: -1.5, lineHeight: 1.05, background: `linear-gradient(135deg,${T.molten},${T.brass},${T.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Debate Furnace</h1><p style={{ color: T.textDim, fontSize: 14, lineHeight: 1.5 }}>We do not give you the answer.<br />We show you what survived the heat.</p><p style={{ color: T.muted, fontSize: 13, lineHeight: 1.7 }}>Throw any question in. The debate adapts to the type and pressure-tests both sides.</p></div><div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>{[["⚔", "Pressure Test Both Sides", "Both advocates are pushed hard."], ["⚑", "Flag the Smoke", "Unsupported claims and retreats are called out."], ["🧭", "You Decide", "The final report shows what remains unresolved."]].map(([i, t, b]) => <div key={t} style={{ background: T.card, border: `1px solid ${T.border}`, borderTop: `2px solid ${T.ember}`, borderRadius: 12, padding: 16 }}><div style={{ fontSize: 20, marginBottom: 8 }}>{i}</div><b style={{ fontSize: 12 }}>{t}</b><p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{b}</p></div>)}</div><div style={{ fontSize: 10, letterSpacing: 3, color: T.muted, fontWeight: 700, marginBottom: 10 }}>STARTER QUESTIONS</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>{STARTERS.map((s) => <button key={s} onClick={() => setQuestion(s)} style={{ background: question === s ? `${T.ember}18` : T.charcoal, border: `1px solid ${question === s ? T.ember : T.border}`, borderRadius: 20, padding: "7px 14px", fontSize: 12, color: question === s ? T.ember : T.textDim, cursor: "pointer" }}>{s}</button>)}</div><div style={{ background: T.surface, border: `1px solid ${T.ember}44`, borderRadius: 16, padding: mobile ? 16 : 22, marginBottom: 18 }}><label style={{ fontSize: 10, letterSpacing: 3, color: T.brass, fontWeight: 800 }}>QUESTION UNDER PRESSURE</label><textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="State the question you want pressure tested..." style={{ width: "100%", marginTop: 8, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", color: T.text, fontSize: 14, resize: "vertical", fontFamily: "inherit", lineHeight: 1.65 }} /><div style={{ ...grid, marginTop: 14 }}>{[[sideA, setSideA, T.sideA, "SIDE A POSITION"], [sideB, setSideB, T.sideB, "SIDE B POSITION"]].map(([v, set, c, l]) => <div key={l}><label style={{ fontSize: 10, letterSpacing: 2, color: c, fontWeight: 800 }}>{l}</label><input value={v} onChange={(e) => set(e.target.value)} placeholder="Optional — auto-labeled if blank" style={{ width: "100%", marginTop: 6, background: T.charcoal, border: `1px solid ${c}33`, borderRadius: 9, padding: "10px 12px", color: T.text, fontSize: 13 }} /></div>)}</div></div><div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 10, marginBottom: 18 }}>{["balanced", "aggressive", "ruthless"].map((x) => <button key={x} onClick={() => setIntensity(x)} style={{ flex: 1, padding: "12px 8px", background: intensity === x ? T.surface : T.charcoal, border: `2px solid ${intensity === x ? colors[x] : T.border}`, borderRadius: 12, cursor: "pointer" }}><b style={{ color: colors[x], textTransform: "capitalize" }}>{x}</b></button>)}</div><button onClick={start} disabled={!question.trim()} style={{ width: "100%", background: question.trim() ? `linear-gradient(135deg,${T.molten},${T.brass})` : T.charcoal, border: "none", borderRadius: 12, padding: 16, fontSize: 15, fontWeight: 900, color: question.trim() ? "white" : T.muted, cursor: question.trim() ? "pointer" : "not-allowed", letterSpacing: 2 }}>IGNITE DEBATE</button></div></div>;

  const h = HEAT[debate.heatLevel] || HEAT.medium;
  const r = debate.rounds[round];
  const result = debate.matchWinner === "CONTESTED" ? "Contested Result" : debate.matchWinner === "TIE" ? "Split Decision" : `${debate.matchWinner === "A" ? debate.shortA : debate.shortB} Survived Stronger`;
  const unburned = debate.label === "Moral / Philosophical" ? "UNBURNED CLAIMS TO VERIFY OR CLARIFY" : "UNBURNED CLAIMS TO VERIFY";

  return <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", color: T.text }}><div style={{ position: "sticky", top: 0, zIndex: 10, background: `${T.bg}f2`, backdropFilter: "blur(16px)", borderBottom: `1px solid ${T.border}`, padding: "10px 20px" }}><div style={{ maxWidth: 940, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span style={{ fontSize: 11, letterSpacing: 4, color: T.ember, fontWeight: 900 }}>DEBATE FURNACE</span><Pill color={h[2]}>{h[0]}</Pill><Pill color={T.brass}>{debate.icon} {debate.label}</Pill></div><div style={{ display: "flex", gap: 8 }}>{final && <button onClick={copy} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", color: copied ? T.judge : T.muted, cursor: "pointer" }}>{copied ? "Copied" : "Copy Report"}</button>}<button onClick={reset} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", color: T.muted, cursor: "pointer" }}>Reset</button></div></div></div><div style={{ maxWidth: 940, margin: "0 auto", padding: mobile ? "14px 12px" : "20px" }}><div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}><div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 8 }}>{question}</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><Pill color={T.sideA}>{debate.shortA}: {debate.sideA}</Pill><Pill color={T.sideB}>{debate.shortB}: {debate.sideB}</Pill><Pill color={colors[intensity]}>{intensity}</Pill></div></div>{analysis ? <Section title={`${debate.icon} QUESTION ANALYSIS`} color={T.brass}><div style={grid}><p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.75 }}>{debate.desc}</p><div>{debate.criteria.map((c) => <span key={c} style={{ display: "inline-block", background: `${T.gold}10`, border: `1px solid ${T.gold}30`, borderRadius: 8, padding: "2px 8px", fontSize: 11, color: T.gold, margin: 2 }}>{c}</span>)}</div></div><button onClick={stoke} style={{ marginTop: 16, background: `linear-gradient(135deg,${T.molten},${T.brass})`, border: "none", borderRadius: 10, padding: "12px 22px", color: "white", fontWeight: 900, cursor: "pointer" }}>BEGIN ROUND 1 — OPENING ARGUMENTS</button></Section> : !final ? <><div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}><Pill color={T.ember}>ROUND {r.round} — {r.label.toUpperCase()}</Pill></div><div style={grid}>{[[debate.shortA, r.aArg, T.sideA, "A"], [debate.shortB, r.bArg, T.sideB, "B"]].map(([n, a, c, s]) => <div key={s} style={{ background: T.card, border: `1px solid ${c}28`, borderTop: `3px solid ${c}`, borderRadius: 12, padding: mobile ? 16 : 20 }}><b style={{ color: c }}>{s} {n.toUpperCase()}</b><p style={{ fontSize: 13.5, lineHeight: 1.8 }}>{a}</p></div>)}</div><div style={{ background: T.card, border: `1px solid ${T.judge}33`, borderLeft: `3px solid ${T.judge}`, borderRadius: 12, padding: mobile ? 16 : 20, marginTop: 14, marginBottom: 20 }}><div style={{ fontSize: 10, letterSpacing: 3, color: T.judge, fontWeight: 800, marginBottom: 14 }}>FURNACE JUDGE — ROUND {r.round}</div><div style={grid}><Score label={debate.shortA} score={r.sa} color={T.sideA} /><Score label={debate.shortB} score={r.sb} color={T.sideB} /></div><p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65 }}>{r.judgeNote}</p></div><button onClick={stoke} style={{ width: "100%", background: "linear-gradient(135deg,#111825,#1a1228)", border: `1px solid ${T.sideA}44`, borderRadius: 12, padding: 14, color: T.sideA, fontWeight: 800, cursor: "pointer" }}>{round < 2 ? `STOKE THE FURNACE → ROUND ${round + 2}` : "STOKE THE FURNACE → WHAT SURVIVED"}</button></> : <><div style={{ background: "linear-gradient(135deg,#130f08,#0f0810)", border: `1px solid ${T.gold}44`, borderRadius: 16, padding: mobile ? 20 : 28, textAlign: "center", marginBottom: 18 }}><div style={{ fontSize: 10, letterSpacing: 6, color: T.brass, marginBottom: 10 }}>WHAT SURVIVED THE HEAT</div><div style={{ fontSize: mobile ? 24 : 30, fontWeight: 900, color: T.gold }}>{result}</div><div style={{ fontSize: 13, color: T.muted, marginTop: 8 }}>{debate.shortA}: {debate.aWins} rounds · {debate.shortB}: {debate.bWins} rounds{debate.ties ? ` · ${debate.ties} tie` : ""}</div><Pill color={h[2]}>{h[0]} — {h[1]}</Pill><p style={{ fontSize: 11, color: T.muted, fontStyle: "italic" }}>Survived stronger means performed better under pressure — not objectively correct.</p></div><Section title={`${debate.icon} WHAT THE QUESTION WAS REALLY ASKING`} color={T.brass}><p style={{ fontSize: 13, lineHeight: 1.75, color: T.textDim }}>{debate.desc}</p></Section><Section title="KEY TAKEAWAYS" color={T.gold}>{debate.take.map(([t, b]) => <p key={t} style={{ fontSize: 13, color: T.textDim, lineHeight: 1.7 }}><b style={{ color: T.text }}>{t}:</b> {b}</p>)}</Section><div style={grid}><Card title={`STRONGEST — ${debate.shortA.toUpperCase()}`} color={T.sideA}>{debate.strongA}</Card><Card title={`STRONGEST — ${debate.shortB.toUpperCase()}`} color={T.sideB}>{debate.strongB}</Card><Card title={`WHERE ${debate.shortA.toUpperCase()} CRACKED`} color={T.ember}>{debate.crackA}</Card><Card title={`WHERE ${debate.shortB.toUpperCase()} CRACKED`} color={T.ember}>{debate.crackB}</Card></div><Section title={unburned} color={T.smoke}>{debate.verify.map((v) => <div key={v} style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65, marginBottom: 8 }}>• {v}</div>)}</Section><Section title="WHAT WOULD CHANGE THE VERDICT?" color={T.brass}><div style={grid}>{[[`Make ${debate.shortA} stronger`, debate.changeA, T.sideA], [`Make ${debate.shortB} stronger`, debate.changeB, T.sideB]].map(([t, items, c]) => <div key={t}><b style={{ fontSize: 11, color: c }}>{t.toUpperCase()}</b>{items.map((i) => <div key={i} style={{ fontSize: 12, color: T.textDim, lineHeight: 1.65, marginTop: 6 }}>• {i}</div>)}</div>)}</div></Section><Section title="CORE HEAT POINT" color={T.gold}><p style={{ fontSize: 15, lineHeight: 1.75, fontStyle: "italic" }}>{debate.core}</p></Section><Section title="DECISION COMPASS" color={T.gold}><p>If you prioritize <b style={{ color: T.sideA }}>{debate.comp[0]}</b>, {debate.shortA} feels stronger.</p><p>If you prioritize <b style={{ color: T.sideB }}>{debate.comp[1]}</b>, {debate.shortB} feels stronger.</p><p><span style={{ color: T.muted }}>The unresolved question: </span><em style={{ color: T.gold }}>{debate.comp[2]}</em>.</p><div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, fontSize: 13, color: T.muted, fontStyle: "italic" }}>The decision is yours. This furnace shows what survived — not what's objectively true.</div></Section><div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 18, overflow: "hidden" }}><button onClick={() => setOpen(!open)} style={{ width: "100%", background: "none", border: "none", padding: "14px 18px", display: "flex", justifyContent: "space-between", color: T.muted, fontWeight: 800, cursor: "pointer" }}>FULL DEBATE TRANSCRIPT <span>{open ? "▲" : "▼"}</span></button>{open && <div style={{ padding: "4px 18px 22px", borderTop: `1px solid ${T.border}` }}>{debate.rounds.map((rr) => <div key={rr.round} style={{ marginTop: 20 }}><b style={{ fontSize: 10, letterSpacing: 3, color: T.ember }}>ROUND {rr.round} — {rr.label.toUpperCase()}</b><p><b style={{ color: T.sideA }}>{debate.shortA}:</b> {rr.aArg}</p><p><b style={{ color: T.sideB }}>{debate.shortB}:</b> {rr.bArg}</p><div style={{ background: T.charcoal, borderRadius: 8, padding: 12, fontSize: 13, color: T.muted }}><b style={{ color: T.judge }}>JUDGE:</b> {rr.judgeNote}</div></div>)}</div>}</div><p style={{ textAlign: "center", color: T.muted, fontSize: 12, fontStyle: "italic" }}>"We do not give you the answer. We show you what survived the heat."</p><div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 12 }}><button onClick={copy} style={{ flex: 1, background: T.charcoal, border: `1px solid ${T.border}`, borderRadius: 12, padding: 13, color: copied ? T.judge : T.muted, fontWeight: 800, cursor: "pointer" }}>{copied ? "Copied" : "Copy Full Report"}</button><button onClick={reset} style={{ flex: 1, background: `linear-gradient(135deg,${T.molten},${T.brass})`, border: "none", borderRadius: 12, padding: 13, color: "white", fontWeight: 900, cursor: "pointer" }}>NEW DEBATE</button></div></>}</div></div>;
}
