// api/chat-pranami.js
// STRICT Tartam Vidya Compass backend using Responses API + file_search
//
// - Uses ONLY the Pranami Tartam vector store via file_search
// - NO generic fallback
// - Returns meta.usedVectorStore + meta.error for your debug line

const PRANAMI_VECTOR_STORE_ID = "vs_6932802f55848191b75d5e57cbebda8d";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Call OpenAI Responses API with file_search + JSON schema output
async function callTartamWithVectorStore(question) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set on the server.");
  }

  const systemPrompt = `
You are "Tartam Vidya Compass" – a spiritual reflection assistant rooted ONLY in
the Pranami / Tartam scriptures that are connected to you via file_search.

Your core sources include (but are not limited to):
- Tartam Sāgar and its sections
- Rāsa scriptures
- Khulāsa / Khulaasa texts
- Other Pranami teachings in this corpus

Your responsibilities:

1) GROUNDING IN SCRIPTURE
- Always treat the retrieved Tartam / Pranami passages as your primary ground.
- Read the retrieved chunks carefully and base your answer on their meaning.
- Do NOT invent shlokas or verses that are not supported by the retrieved text.
- You may gently paraphrase or compress a line from the retrieved text,
  but never fabricate ornate verse-sounding lines out of nothing.

2) KEY CONCEPTS (VERY IMPORTANT)
When relevant to the user's situation and supported by the retrieved text, you may
speak about themes such as:
- Surat (the soul's conscious attention or gaze)
- Divya Prakāś / Divine Light
- Sundar as the Supreme Divine (NOT just "beautiful" in a generic sense)
- Paramdham / Paramadhāma
- Rāj Vidyā as the royal, supreme knowledge of the Divine
- The unity of Ātma and Purushottam
- Yogamāyā and the divine play (Līlā)
- The soul's journey home to its Source

Never reduce these words to generic meanings:
- "Sundar" must NOT be described as merely "handsome" or "pretty".
  It is the name / aspect of the Supreme Divine in this tradition.
- "Rāj Vidyā" must not be treated as a random phrase; it relates to
  supreme spiritual knowledge, not worldly success coaching.

3) WHEN SOURCES ARE THIN OR UNCLEAR
- FIRST, try your best to interpret the retrieved Tartam passages, even if they are
  fragmentary or poetic. Look for the spiritual essence.
- ONLY if you truly cannot find any meaningful connection in the retrieved Tartam text,
  you may gently say: "I’m not able to find a clear Tartam teaching for this exact
  question in the sources I can see."
- In that rare case, you may still offer very light, humble guidance in the spirit
  of the tradition, but clearly indicate the limitation.

4) STYLE AND TONE
- Your tone should be warm, devotional, and humble.
- Avoid generic self-help language; keep the flavour close to Pranami / Tartam spirit.
- You may explain in simple, modern language so that a contemporary seeker can
  understand and apply the guidance.
- Do not be harsh or fatalistic; be compassionate and steady.

5) OUTPUT FORMAT (STRICT)
You MUST output a single JSON object ONLY (no extra preface, no explanation around it),
with exactly these three fields:

{
  "verse_snippet": "one or two lines that capture the essence; either a gentle paraphrase of a retrieved line or a short thematic summary grounded in the Tartam sources.",
  "explanation": "3–6 short paragraphs explaining the guidance in simple, clear language, explicitly tying back to the Tartam / Pranami ideas and metaphors, without inventing fake shlokas.",
  "directive": "A numbered or bulleted list with 3–6 simple, practical steps that a seeker can apply in daily life, consistent with Tartam teachings and the retrieved material."
}

- Do NOT include any extra keys.
- Do NOT output anything before or after the JSON.
- The JSON must be valid and parseable.
`.trim();


  const userPrompt = `
User's situation:

"${question}"
`.trim();

  const payload = {
    model: "gpt-4.1-mini",

    // Put user's text here
    input: userPrompt,

    // Put our instructions here
    instructions: systemPrompt,

    // Attach Tartam vector store directly on the file_search tool
    tools: [
      {
        type: "file_search",
        vector_store_ids: [PRANAMI_VECTOR_STORE_ID],
        // optional, but we can tune later
        max_num_results: 10
      }
    ],

    // NEW Responses API style: use text.format instead of response_format
    text: {
      format: {
        type: "json_schema",
        name: "tartam_guidance",
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
    console.error("OpenAI Responses API error (Tartam):", apiRes.status, body);
    throw new Error(
      body.error?.message ||
        `OpenAI Responses API failed with status ${apiRes.status}`
    );
  }

  // Preferred shortcut: body.output_text (string)
  let raw = body.output_text || "";

  // If output_text is missing, fall back to output[ ] structure
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
    console.error("Failed to parse Tartam JSON:", raw);
    throw new Error("Model output was not valid JSON.");
  }

  return parsed;
}

export default async function handler(req, res) {
  const start = Date.now();

  // --- CORS (same pattern as other Atma Samvad APIs) ---
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
    const result = await callTartamWithVectorStore(question);

    return res.status(200).json({
      success: true,
      verse_snippet: result.verse_snippet || "",
      explanation: result.explanation || "",
      directive: result.directive || "",
      meta: {
        usedVectorStore: true, // we successfully called the Tartam path
        error: null,
        elapsedMs: Date.now() - start
      }
    });
  } catch (err) {
    console.error("Tartam backend error:", err);

    return res.status(200).json({
      success: false,
      verse_snippet: "",
      explanation: "",
      directive: "",
      error: err.message || "Unexpected error in Tartam backend",
      meta: {
        usedVectorStore: false,
        error: err.message || "Unexpected error in Tartam backend",
        elapsedMs: Date.now() - start
      }
    });
  }
}
