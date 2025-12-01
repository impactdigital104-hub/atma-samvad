// Gita Ashram – backend for /api/chat-gita-mind-coach
//
// Feature: "mind_coach"
//
// Input: { language, payload: { emotion, context } }
// Output: structured JSON with Gita-based emotional coaching.
//
// This endpoint is intentionally separate from chat-gita.js so that
// we can evolve Mind Coach logic without touching Decision Compass or Q&A.

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// -----------------------------------------------------------------------
// Main handler
// -----------------------------------------------------------------------

export default async function handler(req, res) {
  const start = Date.now();

  // --- Basic CORS setup (copied from chat-gita.js for consistency) ---
  const allowedOrigins = [
    "https://atma-samvad-gita-ashram-frontend.vercel.app",
    "https://samvad.atmavani.life",
    "https://www.atmavani.life"
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // fallback (you can make this stricter later)
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
      feature: "mind_coach",
      success: false,
      language: "en",
      content: null,
      meta: {
        model: "gita-mind-coach-v1",
        elapsedMs: Date.now() - start,
        error: "Method not allowed"
      }
    });
  }

  // --- Parse JSON body safely ---
  let body;
  try {
    body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};
  } catch (err) {
    return res.status(400).json({
      feature: "mind_coach",
      success: false,
      language: "en",
      content: null,
      meta: {
        model: "gita-mind-coach-v1",
        elapsedMs: Date.now() - start,
        error: "Invalid JSON body"
      }
    });
  }

  const language = body.language || "en";
  const payload = body.payload || {};

  const rawEmotion = (payload.emotion || "").trim();
  const rawContext = (payload.context || "").trim();

  if (!rawEmotion) {
    return res.status(400).json({
      feature: "mind_coach",
      success: false,
      language,
      content: {
        message:
          "Please select what you are feeling (for example: anger, fear, guilt, anxiety, confusion, jealousy, sadness)."
      },
      meta: {
        model: "gita-mind-coach-v1",
        elapsedMs: Date.now() - start,
        error: "Missing 'emotion' in payload for Mind Coach"
      }
    });
  }

  const emotion = rawEmotion.toLowerCase();
  const context = rawContext;

  // If no API key, gracefully return a simple explanation hint
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set for Gita Mind Coach");
    const content = buildFallbackMindCoach({ emotion, context, language });
    return res.status(200).json({
      feature: "mind_coach",
      success: true,
      language,
      content,
      meta: {
        model: "gita-mind-coach-v1",
        elapsedMs: Date.now() - start,
        _debugSource: "no-api-key"
      }
    });
  }

  try {
    const content = await handleMindCoach(
      { emotion, context },
      { language }
    );

    return res.status(200).json({
      feature: "mind_coach",
      success: true,
      language,
      content,
      meta: {
        model: "gita-mind-coach-v1",
        elapsedMs: Date.now() - start
      }
    });
  } catch (err) {
    console.error("Gita Mind Coach model error:", err);
    const fallback = buildFallbackMindCoach({ emotion, context, language });
    return res.status(500).json({
      feature: "mind_coach",
      success: false,
      language,
      content: fallback,
      meta: {
        model: "gita-mind-coach-v1",
        elapsedMs: Date.now() - start,
        error: "exception"
      }
    });
  }
}

// -----------------------------------------------------------------------
// Fallback content for Mind Coach (no API key or errors)
// -----------------------------------------------------------------------

function buildFallbackMindCoach({ emotion, context, language }) {
  const label =
    emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();

  const contextSnippet = context
    ? " You’ve also shared a bit about your situation, which already shows sincerity."
    : "";

  return {
    emotionLabel: label,
    shortSummary:
      `You are feeling ${label.toLowerCase()} and trying to make sense of it.` +
      contextSnippet,

    gitaLens: {
      summary:
        "The Gita treats strong emotions as moments to pause, see clearly, and realign with dharma, not as proof that you are failing.",
      points: [
        "Big emotions often arise when there is a clash between expectations, desires, and your deeper sense of right action (dharma).",
        "Instead of seeing the emotion as an enemy, you can see it as a signal that some inner realignment is needed.",
        "Krishna keeps inviting Arjuna to look at his state of mind, not with shame, but with honesty and courage."
      ]
    },

    reframeBullets: [
      "Instead of ‘something is wrong with me’, you might try ‘something important in me is asking for attention and clarity.’",
      "Rather than fighting the emotion, you can sit with it and gently ask, ‘What is this trying to tell me about what really matters?’"
    ],

    verses: [
      {
        ref: "Bhagavad Gita 2.14",
        sanskrit: "",
        translation:
          "O Arjuna, the appearances of happiness and distress, and their disappearance in due course, are like the appearance and disappearance of winter and summer seasons.",
        note: "This verse reminds you that emotions rise and fall. You are invited to notice them, learn from them, and not let them define your deepest self."
      }
    ],

    resetPractice: {
      title: "2-minute Gita pause with breath",
      steps: [
        "Sit comfortably and place one hand lightly on your chest or heart area.",
        "Take 5 slow breaths, letting each exhale be just a little longer than the inhale.",
        "On each exhale, silently say: ‘For a moment, I allow this feeling to be here.’",
        "On the last breath, silently say: ‘May I see my next step with more clarity and kindness.’"
      ]
    },

    experiment24h:
      "In the next 24 hours, notice one moment when this emotion rises again. Instead of reacting immediately, take three slow breaths, remember one line from the Gita that comforts you, and then choose a slightly kinder or wiser response than usual."
  };
}

// -----------------------------------------------------------------------
// Core logic for Gita Mind Coach
// -----------------------------------------------------------------------

async function handleMindCoach(input, { language }) {
  const { emotion, context } = input;

  const systemPrompt = `
You are "Gita Mind Coach", a gentle, emotionally-aware guide that uses
the Bhagavad Gita to help users work with their present emotion.

The user will give you:
- a primary emotion label (e.g. anger, fear, anxiety, confusion, guilt, jealousy, sadness, other)
- a short free-text description of their situation (may be blank)

Your job is to:
1. Reflect the emotion back with sensitivity.
2. Explain how this emotion can be seen through the lens of the Bhagavad Gita.
3. Offer a compassionate, non-judgmental reframing.
4. Suggest a few relevant Gita shlokas.
5. Give a short 2-minute inner reset practice.
6. Suggest ONE small behavioural experiment for the next 24 hours.

IMPORTANT SAFETY:
- You are NOT a doctor, therapist, or lawyer.
- DO NOT diagnose any mental health condition.
- DO NOT mention psychiatric labels like "depression", "anxiety disorder", "bipolar".
- DO NOT give medical, legal, or financial advice.
- If the user hints at self-harm, hopelessness, or severe distress,
  gently suggest reaching out to a trusted person or local professional support.

TONE:
- Warm, grounded, and steady – like a wise elder who has deeply lived the Gita.
- Never scolding or shaming.
- Avoid heavy Sanskrit jargon; explain in simple, everyday language.
- Assume the user may be emotionally raw; be concise and kind.

BHAGAVAD GITA USAGE:
- You may cite verses with chapter and verse number (e.g. "Bhagavad Gita 2.47").
- Keep Sanskrit snippets short, and always give a simple English explanation.
- Focus more on practical application to the user's life than on intellectual commentary.

OUTPUT FORMAT (VERY IMPORTANT):
You MUST respond with a single valid JSON object and NOTHING ELSE.
No markdown, no commentary, no explanations.

The JSON MUST have exactly these fields:

{
  "emotionLabel": string,
  "shortSummary": string,
  "gitaLens": {
    "summary": string,
    "points": string[]
  },
  "reframeBullets": string[],
  "verses": [
    {
      "ref": string,
      "sanskrit": string,
      "translation": string,
      "note": string
    }
  ],
  "resetPractice": {
    "title": string,
    "steps": string[]
  },
  "experiment24h": string
}

- All strings should be plain text (no markdown).
- Keep the overall response compact but emotionally rich.
- If context is blank, work with the emotion in a general way.
- If context is present, adapt examples and wording to that situation.
  `;

  const userPrompt = `
User emotion: ${emotion}
User language preference: ${language || "en"}

User context (may be empty):
${context || "(no additional context provided)"}

Please produce the JSON object exactly as specified. Do not wrap it in backticks.
  `;

  const payload = {
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.4,
    max_tokens: 1400
  };

  const apiRes = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    }
  );

  if (!apiRes.ok) {
    const errorText = await apiRes.text().catch(() => "");
    console.error(
      "OpenAI API error (Gita Mind Coach):",
      apiRes.status,
      errorText
    );
    throw new Error("Upstream Mind Coach model error");
  }

  const data = await apiRes.json();
  const text = (data?.choices?.[0]?.message?.content || "").trim();

  if (!text) {
    throw new Error("Empty response from Gita Mind Coach model");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Mind Coach JSON:", err);
    throw new Error("Parse error in Mind Coach model output");
  }

  // Basic sanitisation / defaults
  const safe = {
    emotionLabel: parsed.emotionLabel || "",
    shortSummary: parsed.shortSummary || "",
    gitaLens: {
      summary: parsed?.gitaLens?.summary || "",
      points: Array.isArray(parsed?.gitaLens?.points)
        ? parsed.gitaLens.points
        : []
    },
    reframeBullets: Array.isArray(parsed.reframeBullets)
      ? parsed.reframeBullets
      : [],
    verses: Array.isArray(parsed.verses)
      ? parsed.verses.map((v) => ({
          ref: v.ref || "",
          sanskrit: v.sanskrit || "",
          translation: v.translation || "",
          note: v.note || ""
        }))
      : [],
    resetPractice: {
      title: parsed?.resetPractice?.title || "",
      steps: Array.isArray(parsed?.resetPractice?.steps)
        ? parsed.resetPractice.steps
        : []
    },
    experiment24h: parsed.experiment24h || ""
  };

  return safe;
}
