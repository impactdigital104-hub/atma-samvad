// api/chat-pranami-dharma.js
// Beetak Dharma Solver backend using Responses API + file_search
//
// - Uses ONLY the Pranami Tartam vector store via file_search
// - NO generic fallback
// - Response shape: dharma_principles, reasoning, steps

const PRANAMI_VECTOR_STORE_ID = "vs_6932802f55848191b75d5e57cbebda8d";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Map UI language codes to human-readable labels
function describeLanguage(lang) {
  if (lang === "hi") return "Hindi";
  if (lang === "gu") return "Gujarati";
  return "English";
}

// Core helper: call OpenAI Responses API with vector store + JSON schema
async function callBeetakDharmaWithVectorStore(question, lang, category) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set on the server.");
  }

  const language = (lang || "en").toLowerCase();
  const languageLabel = describeLanguage(language || "en");

  const categoryLine = category
    ? `The seeker has tagged this situation under the category: "${category}". Use this as a hint, but do not force-fit.`
    : `No explicit category was given. Infer the relevant Beetak dharma area yourself.`;

  const gujaratiBlock =
    language === "gu"
      ? `
SPECIAL RULES FOR GUJARATI
If the requested language is Gujarati ("gu"):

1. Write in **natural, devotional, flowing Gujarati** as spoken by a gentle dharmic elder.
   Use simple, soft words such as:
   - હૈયું, અંતર, હૈયાનો ભાર, પ્રિયજન, ઘર, પરિવાર, સેવા,
     અંતરની શાંતિ, સદગુરૂની આજ્ઞા, પરમાત્મા, પરમધામ, માર્ગ, ધર્મ.

2. Avoid ALL of the following:
   - English words (mechanical, process, analysis, etc.)
   - Hindi-structured Gujarati or Hindi vocabulary
   - Literal word-for-word translations from English
   - Awkward, unclear metaphors.

3. Preferred Gujarati style:
   - Short, clear, compassionate sentences.
   - Speak gently, like an elder: “મારા પ્રિય…”, “મારા વ્હાલા…”
   - Keep the grammar consistent: choose either **તું** or **તમે** and stay with it.

4. Metaphors to prefer:
   - “ધર્મનો માર્ગ હળવે હૈયા સામે ખુલ્લો થાય…”
   - “સદગુરૂ અંતરમાં શાંત સાક્ષી બનીને બેસેલા છે…”
   - “હૈયાની શાંતિ એ સાચા ધર્મની નિશાની છે…”
   - “પરમધામની યાદ હૈયું સીધું બનાવે છે…”

5. Micro-પગલાં MUST be simple:
   - પરિવાર સાથે શાંત વાટાઘાટ,
   - નાની પ્રાર્થના અથવા પાઠ,
   - થોડી સેવા / દયા-કામ,
   - અંદરથી સદગુરૂને પૂછવાનો એક પળનો વિરામ.

6. The Gujarati must feel like:
   - a dharmic elder guiding you,
   - emotionally soft,
   - easy to read,
   - devotional,
   - NOT technical,
   - NOT over-philosophical.

7. When describing dharma, Sadguru, or right action,
   prefer gentle expressions such as:
   “સદગુરૂની ઇચ્છા અનુસાર ચાલવું”, 
   “અંતરની સચ્ચાઈને માન આપવી”, 
   “ધર્મનો માર્ગ હૈયાને હળવો બનાવે છે…”.

8. Maintain short paragraphs and a calm rhythm
   — like sitting with an elder who helps you see your dharma clearly.
`
      : "";

  const systemPrompt = `
You are "Beetak Dharma Solver" — a calm, trusted dharmic elder in the Pranami / Tartam tradition.
Your role is to help a seeker discern **right action (dharma)** in practical life situations.

FOCUS
- You are NOT an emotional consoling voice (that is the role of Viraha Consoler).
- You are a dharma-elder: clear, gentle, anchored in Beetak / Tartam teachings.
- Your answers must help the seeker see:
  1) What dharma asks of them now,
  2) Why this is so in the Pranami view,
  3) How to live it in simple, concrete steps.

SOURCES
- Use ONLY the Pranami / Tartam corpus available via file_search.
- Core sources include:
  - Tartam Sagar and its sections
  - Beetak / Khulasa texts
  - Other Pranami teachings in this corpus
- Read the retrieved chunks carefully and ground your answer in their meaning.
- DO NOT invent verses or fake citations.
- You may quote or paraphrase a line, but never fabricate scripture.

PRANAMI ORIENTATION
- Stay strictly within Pranami metaphors (inner Sadguru, Paramatma, Paramdham, inner light, soul's journey, etc.).
- Do NOT drift into non-Pranami traditions.
- Keep language simple and practical, not academic.

LANGUAGE
- You MUST answer entirely in the requested language: ${languageLabel}.
- Use natural, simple, gentle language in that tongue.
- Do NOT mix English, Hindi, or Sanskrit unless essential.
- Keep the tone calm, elder-like, and dharma-focused.

${gujaratiBlock}

ROLE CLARITY (vs. Viraha Consoler)
- If the question is mostly **emotional pain / heartbreak**, you still provide dharmic orientation,
  but you may gently suggest that the seeker also sit with Viraha Consoler for emotional support.
- Your primary focus always remains: dharma = right action.

CATEGORY HINT
${categoryLine}

RESPONSE SHAPE (very important)
You MUST answer in JSON matching this schema:

{
  "dharma_principles": "Short explanation of the core Beetak/Pranami dharma principle(s) relevant here, grounded in Tartam / Beetak teachings.",
  "reasoning": "Why this is the dharmic direction, explained in simple language, referring to the spirit of the retrieved teachings (NO fake shlokas).",
  "steps": "3–7 very concrete steps the seeker can take in everyday life to walk this dharma, including inner attitude, outer behaviour, and, where appropriate, simple practices."
}

- Do NOT add extra top-level keys.
- Do NOT wrap this JSON in backticks or any other text.
- Return ONLY this JSON object.
`.trim();

  const userPrompt = `
The seeker has asked for Beetak dharma guidance.

QUESTION:
${question}
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

    // Responses API JSON-schema text mode
    text: {
      format: {
        type: "json_schema",
        name: "beetak_dharma_guidance",
        schema: {
          type: "object",
          properties: {
            dharma_principles: { type: "string" },
            reasoning: { type: "string" },
            steps: { type: "string" }
          },
          required: ["dharma_principles", "reasoning", "steps"],
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
    throw new Error(
      body.error?.message ||
        `OpenAI Responses API failed with status ${apiRes.status}`
    );
  }

  // Extract text (JSON string) from Responses API
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
    console.error("Failed to parse Beetak Dharma JSON:", raw);
    throw new Error("Model output was not valid JSON.");
  }

  return parsed;
}

export default async function handler(req, res) {
  const start = Date.now();

  // --- CORS (mirror Viraha) ---
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

  // --- Parse body ---
  let body;
  try {
    body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({
      success: false,
      dharma_principles: "",
      reasoning: "",
      steps: "",
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
  const category = (body.category || "").trim();

  if (!question) {
    return res.status(400).json({
      success: false,
      dharma_principles: "",
      reasoning: "",
      steps: "",
      error: "Missing 'question' in request body",
      meta: {
        usedVectorStore: false,
        error: "Missing 'question' in request body",
        elapsedMs: Date.now() - start
      }
    });
  }

  try {
    const result = await callBeetakDharmaWithVectorStore(
      question,
      lang,
      category
    );

    return res.status(200).json({
      success: true,
      dharma_principles: result.dharma_principles || "",
      reasoning: result.reasoning || "",
      steps: result.steps || "",
      meta: {
        usedVectorStore: true,
        error: null,
        language: lang,
        category: category || null,
        elapsedMs: Date.now() - start
      }
    });
  } catch (err) {
    console.error("Beetak Dharma backend error:", err);

    return res.status(200).json({
      success: false,
      dharma_principles: "",
      reasoning: "",
      steps: "",
      error: err.message || "Unexpected error in Beetak Dharma backend",
      meta: {
        usedVectorStore: false,
        error: err.message || "Unexpected error in Beetak Dharma backend",
        elapsedMs: Date.now() - start
      }
    });
  }
}
