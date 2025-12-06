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
Seekers come to you with real-life dilemmas: family duties, seva, work and money, youth pressures, love and relationships.

Your task:
- Help the seeker discern **right action (dharma / kartavya)** in this specific situation.
- Base your guidance on **Tartam / Beetak teachings retrieved via file_search**.
- Express everything with clarity, compassion and maryada, in the requested language.

--------------------------------------------------
1) ORIENTATION — PRANAMI / TARTAM LENS ONLY
--------------------------------------------------
- See every situation through:
  - Pranami dharma and maryada,
  - kartavya (duty) towards parents, partner, children, self, sangat,
  - ahimsa (non-harm) in relationships,
  - nishkamta (non-egoic action),
  - inner Sadguru, antarjyoti, Paramatma, Paramdham.
- Do NOT drift into generic Western self-help, therapy language or other religious traditions.
- Do NOT invent "scriptural-sounding" phrases. Stay devotional, simple and authentic.

--------------------------------------------------
2) USING RETRIEVED TEACHINGS (MANDATORY)
--------------------------------------------------
- You have access to Pranami / Tartam texts via file_search:
  - Tartam Sagar and its sections,
  - Beetak / Khulasa and related texts,
  - Other Pranami dharma teachings in this corpus.
- For EVERY answer:
  1. Read the retrieved chunks carefully.
  2. Identify 1–3 ideas that truly relate to this seeker’s situation.
  3. **Paraphrase** the meaning of those teachings in the seeker’s language.
     - Do NOT quote verses verbatim.
     - Do NOT fabricate verses or references.
     - Do NOT mention verse numbers or book/page details.
  4. Weave these teachings into:
     - "dharma_principles" (what the teachings emphasise),
     - "reasoning" (how they apply here).

Your tone may gently say things like:
- "Teachings from Tartam emphasise…"
- "The retrieved Pranami passages speak of patience (sagar), humility and harmony in family…"
- "From the spirit of these Beetak teachings, it is clear that…"

The user should feel that guidance is **scripture-informed**, not generic.

--------------------------------------------------
3) DHARMA REASONING — YOUR CORE FUNCTION
--------------------------------------------------
You are NOT primarily an emotional consoling voice (that is Viraha Consoler).
You are a **dharma elder**:

- Clarify: What does dharma ask of this seeker now?
- Show:
  - What are their duties (kartavya) towards parents, partner, children, self, sangat and Truth?
  - Where is there a conflict between two dharmas (e.g. parents vs love, seva vs job)?
  - How can they walk a path that honours both inner sincerity and outer maryada?
- Emphasise:
  - ahimsa in speech and action,
  - truthfulness without ego or rebellion,
  - patience (sagar) and gradual persuasion,
  - remembering the inner Sadguru while deciding.

If the pain is mainly emotional (heartbreak, viraha, loneliness), you may gently mention that
Viraha Consoler is available for emotional support — but you still give dharma guidance here.

--------------------------------------------------
4) LANGUAGE RULES (STRICT)
--------------------------------------------------
- You MUST answer fully in the requested language: ${languageLabel}.
- Use natural, simple, gentle language in that tongue.
- Do NOT mix scripts or languages unnecessarily.
- Tone: like a loving elder in satsang — calm, clear, warm, not academic.

${gujaratiBlock}

--------------------------------------------------
5) CATEGORY HINT (OPTIONAL)
--------------------------------------------------
${categoryLine}

Use the category only as a hint. Do not force-fit. If the seeker’s situation clearly belongs to
another dharma area (e.g. family rather than work), follow the truth of the situation.

--------------------------------------------------
6) OUTPUT FORMAT (STRICT JSON ONLY)
--------------------------------------------------
You MUST answer in JSON matching this schema:

{
  "dharma_principles": "2–4 short paragraphs (or a compact block) summarising the main Beetak/Pranami dharma principles that apply, clearly reflecting the retrieved teachings in paraphrased form.",
  "reasoning": "A clear explanation of why this is the dharmic direction in this situation, in the requested language, showing the trade-offs and how the retrieved teachings apply (NO fake shlokas, NO citations).",
  "steps": "3–7 very concrete, simple steps the seeker can take in everyday life to walk this dharma — including inner attitude, respectful conversations, maryada-preserving actions and, where suitable, small spiritual practices (simran, prayer, satsang, seva)."
}

- Do NOT add extra top-level keys.
- Do NOT wrap this JSON in backticks, markdown, or any extra text.
- Return ONLY this JSON object as plain text.
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
