// api/chat-gita.js
// Gita Ashram – backend for /api/chat-gita
// Currently: structured reflections using local verse retrieval (no OpenAI yet).

import { extractThemesFromInput, retrieveGitaVerses } from "../lib/gitaDecisionCompass.js";

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
        model: "gita-decisions-v1",
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
        model: "gita-decisions-v1",
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
        model: "gita-decisions-v1",
        elapsedMs: Date.now() - start,
        error: "Missing 'feature' or 'payload' in request body"
      }
    });
  }

  let content;

  switch (feature) {
    case "decision_compass":
      content = await handleDecisionCompass(payload, { language, depth });
      break;

    case "mind_coach":
    case "shloka_to_life":
    case "qna":
    default:
      content = {
        message:
          "This Gita Ashram feature is not implemented yet. Only 'decision_compass' returns full structured content right now."
      };
      break;
  }

  return res.status(200).json({
    feature,
    success: true,
    language,
    content,
    meta: {
      model: "gita-decisions-v1",
      depth,
      elapsedMs: Date.now() - start
    }
  });
}

// --- Core logic for Gita Decision Compass (no OpenAI yet) ---

async function handleDecisionCompass(payload, { language, depth }) {
  const title = (payload.title || "").trim();
  const situation = (payload.situation || "").trim();
  const lifeArea = ((payload.lifeArea || "general").trim()) || "general";
  const emotion = ((payload.emotion || "other").trim()) || "other";
  const timeHorizon =
    ((payload.timeHorizon || "unspecified").trim()) || "unspecified";
  const desiredOutcome = (payload.desiredOutcome || "").trim();
  const constraints = (payload.constraints || "").trim();

  const inputEcho = {
    title,
    situation,
    lifeArea,
    emotion,
    timeHorizon,
    desiredOutcome,
    constraints
  };

  // If no situation is provided, gently ask for it
  if (!situation) {
    return {
      summary:
        "Please describe your situation in a few lines so the Gita can reflect with you.",
      inputEcho,
      gitaLens: [],
      verses: [],
      actionPlan: [],
      innerPractice: {
        title: "Short pause",
        duration: "1–2 minutes",
        instructions:
          "Take a few slow breaths and gently gather your thoughts. When you are ready, describe your situation and try again."
      },
      reflectionQuestions: []
    };
  }

  // 1) Extract themes from the input
  const themes = extractThemesFromInput({
    lifeArea,
    emotion,
    situation,
    desiredOutcome,
    constraints
  });

  // 2) Retrieve 1–3 relevant verses
  const versesRaw = retrieveGitaVerses({
    themes,
    lifeArea,
    emotion,
    situation
  });

  const verses = versesRaw.map((v) => ({
    ref: v.ref,
    excerpt: v.summary || v.text,
    whyRelevant: `This verse speaks about ${v.themes.join(
      ", "
    )}. Its teaching can help you respond to this situation with more clarity and steadiness.`
  }));

  // 3) Build Gita lens bullets
  const gitaLens = [
    "See this situation as a field (kṣetra) for sincere effort rather than a battlefield of ego and fear.",
    "Focus on the dharmic step in front of you instead of getting lost in imagined future results.",
    "Try to act from steadiness and goodwill, not from panic, guilt, or harsh self-judgment."
  ];

  // 4) Simple, practical action plan
  const actionPlan = [
    "Clarify in one or two sentences what truly matters to you here beyond short-term gain or loss.",
    "List your concrete responsibilities in this situation (to yourself, family, work, or others) and see which actions honour them.",
    "Choose one small, dharmic step you can take in the next 24–48 hours and commit to it, offering the result to the Divine."
  ];

  // 5) Short inner practice
  const innerPractice = {
    title: "2-minute Gita pause",
    duration: "2–3 minutes",
    instructions:
      "Sit comfortably and notice your breath. With each exhale, gently release a little of the tightness around this issue. Mentally repeat a simple line like 'I will do my duty and offer the fruits.' Then, for a few moments, imagine placing this situation at the feet of the Divine and asking for clarity to act rightly."
  };

  // 6) Reflection questions
  const reflectionQuestions = [
    "If I set aside fear and people’s opinions for a moment, what feels truest and most self-respecting here?",
    "Which option best honours my deeper responsibilities and values over the next few years, not just the next few days?",
    "What would it look like to act wholeheartedly and then let go of the result, as the Gita teaches?"
  ];

  return {
    summary:
      "The Gita invites you to act from dharma and clarity rather than fear or short-term gain. Choose the option that honours your responsibilities and inner peace.",
    inputEcho,
    gitaLens,
    verses,
    actionPlan,
    innerPractice,
    reflectionQuestions
  };
}
