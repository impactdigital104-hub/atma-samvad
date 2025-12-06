// api/chat-viraha.js
// Viraha Consoler backend using Responses API + file_search
//
// - Uses ONLY the Pranami Tartam vector store via file_search
// - NO generic fallback
// - Same response shape as Tartam Compass (verse_snippet, explanation, directive)

const PRANAMI_VECTOR_STORE_ID = "vs_6932802f55848191b75d5e57cbebda8d";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Map UI language codes to human-readable labels
function describeLanguage(lang) {
  if (lang === "hi") return "Hindi";
  if (lang === "gu") return "Gujarati";
  return "English";
}

// Call OpenAI Responses API with file_search + JSON schema output
async function callVirahaWithVectorStore(question, lang) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set on the server.");
  }

  const language = (lang || "en").toLowerCase();
  const languageLabel = describeLanguage(language);

  const systemPrompt = `
You are "Viraha Consoler" – a spiritual elder and companion rooted ONLY in
the Pranami / Tartam scriptures that are connected to you via file_search.

Your role is to sit with a seeker who is experiencing VIRAH – the pain of
separation, longing, loss, heartbreak, loneliness, or spiritual dryness.

CORE IDENTITY
- You speak as a gentle, steady elder in the Pranami / Tartam tradition.
- You see viraha not as a defect, but as a doorway to deeper union with the Divine.
- You respond with tenderness, depth, and clarity.

SOURCES
- Use ONLY the Pranami / Tartam corpus made available via file_search.
- Your core sources include (but are not limited to):
  - Tartam Sāgar and its sections
  - Rāsa scriptures
  - Khulāsa / Khulaasa texts
  - Other Pranami teachings in this corpus
- Read the retrieved chunks carefully and ground your answer in their meaning.
- Do NOT invent shlokas or verses that are not supported by the retrieved text.
- You may gently paraphrase or compress a line, but never fabricate verse-like lines.

VIRAHA THEMES (when supported by retrieved text)
- Longing for Sundar / the Divine Beloved
- The soul's ache for Paramdham / the true home
- Separation that purifies the heart and melts ego
- Remembering the Beloved in pain
- The unity of Ātma and Purushottam
- Inner companionship of the Divine even when outer life feels empty

LANGUAGE
- You MUST answer entirely in the requested language: ${languageLabel}.
- Use natural, simple, modern language in that tongue.
- If the retrieved text appears in a specific script, you may:
  - either quote a short piece in that script, then explain it in ${languageLabel},
  - or gently paraphrase the essence directly in ${languageLabel}.
- Do NOT mix many languages in one answer. Keep it coherent in ${languageLabel},
  except for brief script quotations if needed.

WHEN SOURCES ARE THIN OR UNCLEAR
- FIRST, do your best with whatever Tartam passages you see.
- ONLY if nothing is usable, you may say (in ${languageLabel}):
  you are not seeing a clear Tartam teaching for this exact question.
- Even then, offer very light, humble guidance in the spirit of viraha.

TONE & STYLE
- Warm, devotional, deeply compassionate.
- Not clinical self-help, but spiritual companionship.
- No harshness, no fatalism, no blaming the seeker.
- You help the seeker:
  - feel understood,
  - find meaning in their viraha,
  - take one or two small spiritual steps today.

OUTPUT FORMAT (STRICT)
You MUST output a single JSON object ONLY (no extra text), with exactly:

{
  "verse_snippet": "one or two lines that capture the essence; either a gentle paraphrase of a retrieved line or a short thematic summary grounded in Tartam sources.",
  "explanation": "3–6 short paragraphs explaining the guidance in simple, clear ${languageLabel}, explicitly tying back to Tartam / Pranami ideas and metaphors.",
  "directive": "A numbered or bulleted list (in ${languageLabel}) with 3–6 simple, practical steps for today, including at least ONE very small micro-practice and a final sentence of reassurance."
}

- Do NOT include extra keys.
- Do NOT output anything before or after the JSON.
- The JSON must be valid and parseable.
`.trim();

  const userPrompt = `
Seeker's viraha situation (answer in ${languageLabel}):

"${question}"
`.trim();

  const payload = {
    model: "gpt-4.1-mini",

    // User text
    input: userPrompt,

    // Instructions
    instructions: systemPrompt,

    // Attach Tartam vector store via file_search
    tools: [
      {
        type: "file_search",
        vector_store_ids: [PRANAMI_VECTOR_STORE_ID],
        max_num_results: 10
      }
    ],

    // Responses API text format with JSON schema
    text: {
      format: {
        type: "json_schema",
        name: "viraha_guidance",
        schema: {
          type: "object",
          properties: {
            verse_snippet: { type: "string" },
            explanation: { type: "string" },
            directive: { type: "string" }
          },
          required: ["verse_snippet", "explanation", "directive"],
          additionalProperties: false
        },
        strict: true
      }
    }
  };

  const apiRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const body = await apiRes.json();

  if (!apiRes.ok) {
    console.error("OpenAI Responses API error (Viraha):", apiRes.status, body);
    throw new Error(
      body.error?.message ||
        `OpenAI Responses API failed with status ${apiRes.status}`
    );
  }

  let raw = body.output_text || "";

  if (!raw && Array.isArray(body.output) && body.output.length > 0) {
    const msgItem = body.output.find((item) => item.type === "message");
    if (
      msgItem &&
      msgItem.content &&
      Array.isArray(msgItem.content) &&
      msgItem.content.length > 0 &&
      msgItem.content[0].type === "output_text"
    ) {
      raw = msgItem.content[0].text || "";
    }
  }

  if (!raw) {
    throw new Error("Model returned empty output_text.");
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse Viraha JSON:", raw);
    throw new Error("Model output was not valid JSON.");
  }

  return parsed;
}

export default async function handler(req, res) {
  const start = Date.now();

  // --- CORS (same as other Samvad APIs) ---
  const allowedOrigins = [
    "https://samvad.atmavani.life",
    "https://www.atmavani.life",
    "https://atma-samvad-gita-ashram-frontend.vercel.app"
  ];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://www.atmavani.life");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({
      success: false,
      verse_snippet: "",
      explanation: "",
      directive: "",
      error: "Invalid JSON body",
      meta: {
        usedVectorStore: false,
        error: "Invalid JSON body",
        elapsedMs: Date.now() - start
      }
    });
  }

  const question = (body.question || "").trim();
  const lang = (body.language || "en").toLowerCase();

  if (!question) {
    return res.status(400).json({
      success: false,
      verse_snippet: "",
      explanation: "",
      directive: "",
      error: "Missing 'question' in request body",
      meta: {
        usedVectorStore: false,
        error: "Missing 'question' in request body",
        elapsedMs: Date.now() - start
      }
    });
  }

  try {
    const result = await callVirahaWithVectorStore(question, lang);

    return res.status(200).json({
      success: true,
      verse_snippet: result.verse_snippet || "",
      explanation: result.explanation || "",
      directive: result.directive || "",
      meta: {
        usedVectorStore: true,
        error: null,
        language: lang,
        elapsedMs: Date.now() - start
      }
    });
  } catch (err) {
    console.error("Viraha backend error:", err);

    return res.status(200).json({
      success: false,
      verse_snippet: "",
      explanation: "",
      directive: "",
      error: err.message || "Unexpected error in Viraha backend",
      meta: {
        usedVectorStore: false,
        error: err.message || "Unexpected error in Viraha backend",
        elapsedMs: Date.now() - start
      }
    });
  }
}
