// api/chat-gita.js
// Gita Ashram – dummy backend for /api/chat-gita
// NOTE: no OpenAI calls yet; just structured sample responses.

export default async function handler(req, res) {
  const start = Date.now();

  // --- Basic CORS setup ---
  const allowedOrigins = [
    "https://atma-samvad-gita-ashram-frontend.vercel.app",
    "https://samvad.atmavani.life"
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // fallback (you can make this more strict later if you like)
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://atma-samvad-gita-ashram-frontend.vercel.app"
    );
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --- Only POST is allowed for actual calls ---
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({
      feature: null,
      success: false,
      language: "en",
      content: null,
      meta: {
        model: "dummy-gita-v1",
        elapsedMs: Date.now() - start,
        error: "Method not allowed"
      }
    });
  }

  // Parse JSON body safely
  let body;
  try {
    body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch (err) {
    return res.status(400).json({
      feature: null,
      success: false,
      language: "en",
      content: null,
      meta: {
        model: "dummy-gita-v1",
        elapsedMs: Date.now() - start,
        error: "Invalid JSON body"
      }
    });
  }

  const feature = body.feature || "qna";
  const language = body.language || "en";
  const depth = body.depth || "standard";
  const payload = body.payload || {};

  if (!feature || !payload) {
    return res.status(400).json({
      feature: feature || null,
      success: false,
      language,
      content: null,
      meta: {
        model: "dummy-gita-v1",
        elapsedMs: Date.now() - start,
        error: "Missing 'feature' or 'payload' in request body"
      }
    });
  }

  let content;

  switch (feature) {
    case "decision_compass":
      content = buildDecisionCompassDummy(payload);
      break;

    case "mind_coach":
    case "shloka_to_life":
    case "qna":
    default:
      content = {
        message:
          "This Gita Ashram feature is not implemented yet in the dummy backend. Only 'decision_compass' returns full structured content right now."
      };
      break;
  }

  return res.status(200).json({
    feature,
    success: true,
    language,
    content,
    meta: {
      model: "dummy-gita-v1",
      depth,
      elapsedMs: Date.now() - start
    }
  });
}

// --- Dummy builder for Gita Decision Compass ---

function buildDecisionCompassDummy(payload) {
  const {
    title,
    situation,
    lifeArea,
    emotion,
    timeHorizon,
    desiredOutcome,
    constraints
  } = payload || {};

  return {
    summary:
      "The Gita invites you to act from dharma and clarity rather than fear or short-term gain. Choose the option that honours your responsibilities and inner peace.",
    inputEcho: {
      title: title || "",
      situation: situation || "",
      lifeArea: lifeArea || "",
      emotion: emotion || "",
      timeHorizon: timeHorizon || "",
      desiredOutcome: desiredOutcome || "",
      constraints: constraints || ""
    },
    gitaLens: [
      "See your situation as a field (kṣetra) for sincere effort, not as a battlefield of ego and anxiety.",
      "Act in a way that serves your deeper responsibilities (svadharma) rather than only short-term comfort or fear.",
      "Offer the fruits of your decision to the Divine, and stay focused on right action rather than imagined outcomes."
    ],
    verses: [
      {
        ref: "BG 2.47",
        excerpt:
          "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action...",
        whyRelevant:
          "This verse helps you focus on choosing and acting wisely, without becoming paralysed by anxiety about results."
      },
      {
        ref: "BG 18.66",
        excerpt:
          "Abandon all varieties of dharmas and simply surrender unto Me...",
        whyRelevant:
          "When the mind feels torn between options, this verse reminds you to trust a higher wisdom and choose what feels most aligned with truth and responsibility."
      }
    ],
    actionPlan: [
      "Step 1 — Clarify: In one or two sentences, write what you are truly seeking here (e.g., integrity, stability, service, growth).",
      "Step 2 — Compare: For each option, note how well it supports that deeper aim and your key responsibilities (family, health, finances, inner growth).",
      "Step 3 — Commit: Choose the option that feels more dharmic and self-respecting, then act wholeheartedly without constant back-and-forth in the mind."
    ],
    innerPractice: {
      title: "2-minute Gita pause",
      duration: "2–3 minutes",
      instructions:
        "Sit quietly, slow down your breath, and mentally repeat a simple verse or mantra (for example, 'Karmanye vadhikaraste'). Offer your confusion to the Divine and ask for clarity to choose what is right, not merely what is comfortable."
    },
    reflectionQuestions: [
      "If fear of loss or judgement was softer for a moment, which option would I feel more at peace with in my heart?",
      "How will this decision help me grow in steadiness, sincerity, and service over the next few years, not just the next few weeks?"
    ]
  };
}
