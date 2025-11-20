// api/chat-gita.js
// Gita Ashram – backend for /api/chat-gita
//
// For feature = "decision_compass":
// - Extract themes from user input
// - Retrieve 1–3 relevant verses
// - Call OpenAI with a Gita-specific system + user prompt
// - Return a structured JSON reflection
//
// If OpenAI fails, we fall back to a local static reflection.

import {
  extractThemesFromInput,
  retrieveGitaVerses
} from "../lib/gitaDecisionCompass.js";

import {
  buildDecisionCompassSystemPrompt,
  buildDecisionCompassUserPrompt
} from "../lib/gitaDecisionPrompts.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

// --- Core logic for Gita Decision Compass ---

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

  // --- Build fallback static content (in case OpenAI fails) ---

  const fallbackVerses = versesRaw.map((v) => ({
    ref: v.ref,
    // prefer the more human-friendly meaning if available
    excerpt: v.shortMeaning || v.summary || v.enTranslation || v.text,
    whyRelevant: `This verse speaks about ${
      Array.isArray(v.themes) ? v.themes.join(", ") : ""
    }. Its teaching can help you respond to this situation with more clarity and steadiness.`,
    // NEW: carry through the scriptural fields so frontend can show them
    devanagari: v.devanagari || "",
    transliteration: v.transliteration || "",
    enTranslation: v.enTranslation || "",
    hiTranslation: v.hiTranslation || ""
  }));


  const fallbackContent = {
    summary:
      "The Gita invites you to act from dharma and clarity rather than fear or short-term gain. Choose the option that honours your responsibilities and inner peace.",
    inputEcho,
    gitaLens: [
      "See this situation as a field (kṣetra) for sincere effort rather than a battlefield of ego and fear.",
      "Focus on the dharmic step in front of you instead of getting lost in imagined future results.",
      "Try to act from steadiness and goodwill, not from panic, guilt, or harsh self-judgment."
    ],
    verses: fallbackVerses,
    actionPlan: [
      "Clarify in one or two sentences what truly matters to you here beyond short-term gain or loss.",
      "List your concrete responsibilities in this situation (to yourself, family, work, or others) and see which actions honour them.",
      "Choose one small, dharmic step you can take in the next 24–48 hours and commit to it, offering the result to the Divine."
    ],
    innerPractice: {
      title: "2-minute Gita pause",
      duration: "2–3 minutes",
      instructions:
        "Sit comfortably and notice your breath. With each exhale, gently release a little of the tightness around this issue. Mentally repeat a simple line like 'I will do my duty and offer the fruits.' Then, for a few moments, imagine placing this situation at the feet of the Divine and asking for clarity to act rightly."
    },
    reflectionQuestions: [
      "If I set aside fear and people’s opinions for a moment, what feels truest and most self-respecting here?",
      "Which option best honours my deeper responsibilities and values over the next few years, not just the next few days?",
      "What would it look like to act wholeheartedly and then let go of the result, as the Gita teaches?"
    ]
  };

  // --- If no API key, just return fallback content ---
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set for Gita Decision Compass");
    return fallbackContent;
  }

  try {
    // 3) Build system and user prompts
    const systemPrompt = buildDecisionCompassSystemPrompt();
    const userPrompt = buildDecisionCompassUserPrompt({
      title,
      situation,
      lifeArea,
      emotion,
      timeHorizon,
      desiredOutcome,
      constraints,
      language,
      depth,
      versesJson: JSON.stringify(versesRaw, null, 2)
    });

    // 4) Call OpenAI
    const modelResponseText = await callDecisionCompassModel({
      systemPrompt,
      userPrompt
    });

    let parsed;
    try {
      parsed = JSON.parse(modelResponseText);
    } catch (err) {
      console.error("Failed to parse Decision Compass JSON:", err);
      parsed = null;
    }

    if (!parsed || typeof parsed !== "object") {
      // If parsing fails, fall back to local content
      return fallbackContent;
    }

    // 5) Normalise content and ensure inputEcho is correct
    const content = {
      summary: parsed.summary || fallbackContent.summary,
      inputEcho, // always trust our own echo
      gitaLens: Array.isArray(parsed.gitaLens) && parsed.gitaLens.length
        ? parsed.gitaLens
        : fallbackContent.gitaLens,
      verses: Array.isArray(parsed.verses) && parsed.verses.length
        ? parsed.verses
        : fallbackContent.verses,
      actionPlan: Array.isArray(parsed.actionPlan) && parsed.actionPlan.length
        ? parsed.actionPlan
        : fallbackContent.actionPlan,
      innerPractice: parsed.innerPractice || fallbackContent.innerPractice,
      reflectionQuestions:
        Array.isArray(parsed.reflectionQuestions) &&
        parsed.reflectionQuestions.length
          ? parsed.reflectionQuestions
          : fallbackContent.reflectionQuestions
    };

    return content;
  } catch (err) {
    console.error("Decision Compass model error:", err);
    return fallbackContent;
  }
}

// --- Helper: call OpenAI for Decision Compass ---

async function callDecisionCompassModel({ systemPrompt, userPrompt }) {
  const payload = {
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.4,
    max_tokens: 900
  };

  const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!apiRes.ok) {
    const errorText = await apiRes.text().catch(() => "");
    console.error(
      "OpenAI API error (Decision Compass):",
      apiRes.status,
      errorText
    );
    throw new Error("Upstream Decision Compass model error");
  }

  const data = await apiRes.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return (text || "").trim();
}
