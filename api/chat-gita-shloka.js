// Gita Ashram – backend for /api/chat-gita-shloka
//
// Feature: "shloka_to_life"
//
// Input: one Bhagavad Gita verse (ref + Sanskrit + transliteration + meaning)
// Output: structured JSON with plain meaning + life applications.
//
// This endpoint is intentionally separate from chat-gita.js so that
// we can evolve Shloka-to-Life logic without touching Decision Compass or Q&A.

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
      feature: "shloka_to_life",
      success: false,
      language: "en",
      content: null,
      meta: {
        model: "gita-shloka-life-v1",
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
      feature: "shloka_to_life",
      success: false,
      language: "en",
      content: null,
      meta: {
        model: "gita-shloka-life-v1",
        elapsedMs: Date.now() - start,
        error: "Invalid JSON body"
      }
    });
  }

  const language = body.language || "en";
  const payload = body.payload || {};

  // Expect: payload = { key, ref, sanskrit:[], translit, meaning }
  const key = (payload.key || "").trim();
  const ref = (payload.ref || "").trim();
  const sanskrit = Array.isArray(payload.sanskrit)
    ? payload.sanskrit
    : [];
  const translit = (payload.translit || "").trim();
  const meaning = (payload.meaning || "").trim();

  if (!ref || sanskrit.length === 0) {
    return res.status(400).json({
      feature: "shloka_to_life",
      success: false,
      language,
      content: null,
      meta: {
        model: "gita-shloka-life-v1",
        elapsedMs: Date.now() - start,
        error:
          "Missing 'ref' or 'sanskrit' in payload for Shloka-to-Life"
      }
    });
  }

  // If no API key, gracefully return a simple explanation hint
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set for Shloka-to-Life");
    return res.status(200).json({
      feature: "shloka_to_life",
      success: true,
      language,
      content: {
        plain:
          "The Shloka-to-Life engine is temporarily offline. Please read this verse slowly and reflect on how it invites you to act with more clarity, steadiness and inner trust.",
        work: [
          "Apply this shloka by doing one small action sincerely at work today, without being overly attached to the result."
        ],
        relationships: [
          "Apply this shloka by bringing a little more patience and goodwill into one relationship conversation today."
        ],
        inner: [
          "Apply this shloka by observing one recurring thought pattern and gently loosening its hold on you."
        ],
        micro: [
          "Take 3 slow breaths, silently recall the verse or its meaning, and offer one worry to the Divine."
        ],
        reflection:
          "In what simple, practical way can I honour the spirit of this verse in the next 24 hours?"
      },
      meta: {
        model: "gita-shloka-life-v1",
        elapsedMs: Date.now() - start,
        _debugSource: "no-api-key"
      }
    });
  }

  try {
    const content = await handleShlokaToLife(
      {
        key,
        ref,
        sanskrit,
        translit,
        meaning
      },
      { language }
    );

    return res.status(200).json({
      feature: "shloka_to_life",
      success: true,
      language,
      content,
      meta: {
        model: "gita-shloka-life-v1",
        elapsedMs: Date.now() - start
      }
    });
  } catch (err) {
    console.error("Shloka-to-Life model error:", err);
    return res.status(500).json({
      feature: "shloka_to_life",
      success: false,
      language,
      content: {
        plain:
          "There was an unexpected error in the Shloka-to-Life engine. Please try again in a little while.",
        work: [],
        relationships: [],
        inner: [],
        micro: [],
        reflection:
          "What does this verse gently invite me to remember about how I am living right now?"
      },
      meta: {
        model: "gita-shloka-life-v1",
        elapsedMs: Date.now() - start,
        error: "exception"
      }
    });
  }
}

// -----------------------------------------------------------------------
// Core logic for Shloka-to-Life
// -----------------------------------------------------------------------

async function handleShlokaToLife(shloka, { language }) {
  const { key, ref, sanskrit, translit, meaning } = shloka;

  const verseLines = sanskrit.join("\n");

  const systemPrompt = `
You are Atma Vani – the Gita Ashram "Shloka-to-Life Transformer".

Your role is to take ONE verse of the Bhagavad Gita at a time and show how it can gently guide a sincere seeker in everyday modern life.

Tone:
- Warm, compassionate, and non-judgmental.
- Practical, human, and grounded.
- Respectful of the scriptural depth without being preachy.

Very important safety:
- You are NOT a doctor, lawyer, or financial advisor.
- Do NOT give medical, legal, financial, or other professional prescriptions.
- If the user’s situation sounds like a serious mental health or physical emergency, gently suggest that they seek support from qualified professionals.

Output FORMAT:
You MUST return a single strict JSON object with EXACTLY these fields:

{
  "plain": "1-3 paragraphs, simple explanation of the verse",
  "work": ["bullet", "bullet", "bullet"],
  "relationships": ["bullet", "bullet", "bullet"],
  "inner": ["bullet", "bullet", "bullet"],
  "micro": ["step 1", "step 2", "step 3"],
  "reflection": "one gentle self-reflection question"
}

Guidelines for each field:

- plain:
  - Explain the spiritual teaching of the verse in simple language.
  - Avoid Sanskrit jargon as much as possible or gently explain it.

- work:
  - 2-4 short bullets.
  - Show how this verse affects how we approach work, duty, and actions.

- relationships:
  - 2-4 short bullets.
  - Show how this verse can soften and clarify how we relate to family, friends, colleagues.

- inner:
  - 2-4 short bullets.
  - Focus on inner emotional life, self-talk, and mental habits.

- micro:
  - 2-4 very small steps (under 2 minutes total) that someone can try today
    as a "micro-practice" to live this verse.
  - Make them realistic and simple.

- reflection:
  - A single question the seeker can journal about or hold in their heart for the day.

Language:
- Default language is English.
- If "language" is not "en", you may adapt the wording to that language as far as you comfortably can, but the scriptural reference remains as given.
`;

  const userPrompt = `
Please reflect on this ONE Bhagavad Gita verse and produce the JSON structure described above.

Verse reference: ${ref}
Internal key (if any): ${key || "(none)"}

Sanskrit:
${verseLines}

Transliteration (if given):
${translit || "(not provided)"}

Existing simple meaning (if given):
${meaning || "(not provided)"}

User language preference: ${language || "en"}

Again, only output the JSON object, nothing else. Do NOT wrap it in backticks or any extra text.
`;

  const payload = {
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.4,
    max_tokens: 1200
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
      "OpenAI API error (Shloka-to-Life):",
      apiRes.status,
      errorText
    );
    throw new Error("Upstream Shloka-to-Life model error");
  }

  const data = await apiRes.json();
  const text = (data?.choices?.[0]?.message?.content || "").trim();

  if (!text) {
    throw new Error("Empty response from Shloka-to-Life model");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Shloka-to-Life JSON:", err);
    throw new Error("Parse error in Shloka-to-Life model output");
  }

  // Basic sanitisation / defaults
  return {
    plain: parsed.plain || "",
    work: Array.isArray(parsed.work) ? parsed.work : [],
    relationships: Array.isArray(parsed.relationships)
      ? parsed.relationships
      : [],
    inner: Array.isArray(parsed.inner) ? parsed.inner : [],
    micro: Array.isArray(parsed.micro) ? parsed.micro : [],
    reflection: parsed.reflection || ""
  };
}
