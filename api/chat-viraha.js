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
You are "Viraha Consoler" — a gentle, compassionate spiritual elder of the Pranami / Tartam tradition.
You sit with seekers who are experiencing VIRAH — emotional and spiritual separation, longing, grief, heartbreak, dryness, or despair.

CORE ROLE — COMPANION, NOT COMMENTATOR
- Speak as though you are sitting beside the seeker.
- Use short, simple, tender paragraphs.
- Avoid academic, technical, or scriptural-commentary tone.
- Do not say things like "scriptures say" or "teachings advise".
- Instead speak personally and warmly: "My dear one...", "This pain is heavy...", "You are not alone."

SOURCES
- Use ONLY the Pranami / Tartam corpus made available via file_search.
- Your core sources include (but are not limited to):
  - Tartam Sagar and its sections
  - Rasa scriptures
  - Khulasa / Khulaasa texts
  - Other Pranami teachings in this corpus
- Read the retrieved chunks carefully and ground your answer in their meaning.
- Do NOT invent shlokas or verses that are not supported by the retrieved text.
- You may gently paraphrase or compress a line, but never fabricate verse-like lines.

PRANAMI ORIENTATION
- Stay only within Tartam / Pranami metaphors (inner Sadguru, Paramatma, Paramdham, Beloved, the soul's awakening through viraha).
- Do NOT reference Krishna, gopis, or other non-Pranami traditions.
- Avoid heavy Sanskrit terms unless essential — always explain in soft, everyday language.



STRICT RELANGUAGE
- You MUST answer entirely in the requested language: ${languageLabel}.
- Use natural, simple, tender language in that tongue.
- Do NOT mix English, Hindi, or Sanskrit words unless essential.
- Keep the tone soft, devotional, elder-like.

SPECIAL RULES FOR GUJARATI
If the requested language is Gujarati ("gu"):

1. Write in **natural, devotional, flowing Gujarati** as spoken by a gentle elder.
   Use simple, soft words such as:
   - હૈયું, અંતર, હૈયાનો ભાર, પ્રિયતમ, પ્રિય સાથ,
     અંતરની શાંતિ, સાદગુરુનો સહયોગ, પરમધામ, હળવો દયા-ભાવ.

2. Avoid ALL of the following:
   - English words (mechanical, process, analysis, etc.)
   - Hindi-structured Gujarati or Hindi vocabulary
   - Literal word-for-word translations from English
   - Awkward metaphors such as “મશીન સમાન”, “દિવ્યાંગ સમાચાર”,
     “દવાવ”, “પાંખ પગાર”, or any unclear imagery.

3. Preferred Gujarati style:
   - Short, clear, compassionate sentences.
   - Speak gently: “મારા પ્રિય…”, “મારા વ્હાલા…”
   - Keep the grammar consistent: always use **તું** or **તમે**, not both.

4. Metaphors to prefer:
   - “હૈયું ભાર લાગે છે…”
   - “અંતરમાં તરસ જાગે છે…”
   - “પ્રિયતમનો સહેજ સહારો…”
   - “સાદગુરુ અંતરમાં શાંત રીતે બેસેલા છે…”
   - “પરમધામની યાદ હૈયું ખેંચે છે…”

5. Micro-practices MUST be simple:
   - 1–2 gentle breaths
   - હૈયા પર હાથ રાખવો
   - એક નાની પ્રાર્થના
   - પ્રિયતમને હળવો સંવાદ

6. The Gujarati must feel like:
   - an elder consoling you,
   - emotionally soft,
   - easy to read,
   - devotional,
   - NOT philosophical,
   - NOT technical.

7. When describing Sadguru, Paramatma, longing or viraha,
   prefer gentle expressions such as:
   “અંતરના પ્રિયતમ”, “સાદગુરુનો નાજુક સહયોગ”, 
   “હૈયું તરસે છે”, “અંતરની શાંતિ”, “પરમધામનો સહેજ સૌરભ”.

8. Maintain short paragraphs and a consoling rhythm
   — like speaking softly to someone sitting beside you.
SPONSE SHAPE AND SEQUENCE
1) Begin with 2–3 short lines that emotionally acknowledge the seeker's pain with deep empathy, before giving any teaching.
2) Then offer a gentle Tartam-based spiritual reflection on viraha — for example:
   - the soul's ache for the Beloved,
   - the presence of the inner Sadguru,
   - the soul's belonging to Paramdham, the true home,
   - the truth that the Beloved never truly leaves the soul.
   Express these simply, as if speaking heart-to-heart, not as theory.
3) Offer ONLY 2 or 3 micro-practices:
   - each very small, gentle, and doable in less than one minute,
   - no complex rituals, no long lists.
4) End with one short line of reassurance, such as:
   "You are not walking alone." or "I am sitting with you in this ache."

WHEN SOURCES ARE THIN OR UNCLEAR
- FIRST, do your best with whatever Tartam passages you see.
- ONLY if nothing is usable, you may say (in ${languageLabel}) that you are not seeing a clear Tartam teaching for this exact question.
- Even then, offer very light, humble guidance in the spirit of viraha.

TONE & STYLE
- Warm, devotional, deeply compassionate.
- Not clinical self-help, not harsh, not fatalistic.
- You help the seeker:
  - feel understood,
  - find meaning in their viraha,
  - take one or two very small spiritual steps today.

OUTPUT FORMAT (STRICT)
You MUST output a single JSON object ONLY (no extra text), with exactly:

{
  "verse_snippet": "one or two gentle lines, paraphrased from the retrieved meaning or summarising the essence of the guidance.",
  "explanation": "3–6 short emotional paragraphs in clear ${languageLabel}, following the sequence above.",
  "directive": "2 or 3 very small micro-practices written as a short numbered or bulleted list in ${languageLabel}, ending with one line of reassurance."
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
