// api/chat-pranami.js
// Pranami Tartam Ashram – backend for /api/chat-pranami
//
// Takes a real-life question/situation from the user,
// calls OpenAI Responses API with File Search over the
// Pranami Tartam vector store, and returns:
//
// {
//   success: true,
//   verse_snippet: "...",
//   explanation: "...",
//   directive: "...",
//   meta: { ... }
// }

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// === PRANAMI TARTAM VECTOR STORE ID ===
const PRANAMI_TARTAM_STORE_ID = "vs_6932802f55848191b75d5e57cbebda8d";

// Small helper: safely parse JSON (for Responses output)
function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// Call OpenAI Responses API with File Search over Tartam store
async function callTartamCompassModel(question) {
  if (!OPENAI_API_KEY || !PRANAMI_TARTAM_STORE_ID) {
    throw new Error("Server is not configured with OPENAI_API_KEY or vector store id.");
  }

  const systemPrompt = `
You are the Tartam Vidya Compass inside the Pranami Tartam Ashram of Atma Samvad.

Your role:
- Listen very gently to the user's real-life situation.
- Draw on Pranami Tartam / Beetak teachings using File Search.
- Offer a short, compassionate reflection in simple, human language.
- Stay humble: you are a digital aid, not a living Guru.

Output format:
You MUST reply as a strict JSON object with exactly these keys:

{
  "verse_snippet": "short quote or summary of the core Tartam insight (2–4 lines, plain text, no markdown)",
  "explanation": "gentle explanation connecting the Tartam insight to the user's situation (3–7 short paragraphs, plain text)",
  "directive": "1–5 simple, concrete micro-practices or shifts they can try over the next 7 days (plain text, you may use 1. 2. 3. style)"
}

Do NOT wrap the JSON in backticks. Do NOT add any extra keys.
If Tartam sources are unclear, still answer gently based on general Pranami spirit,
but keep the same JSON structure.
`.trim();

  const userPrompt = `
User's real-life situation:

"${question}"

Remember:
- Be kind, non-judgmental.
- No medical, legal, or financial prescriptions.
- Encourage seeking appropriate professional help when needed.
`.trim();

  const payload = {
    model: "gpt-4.1-mini",
    input: `${systemPrompt}\n\n---\n\n${userPrompt}`,
    tools: [
      {
        type: "file_search",
        vector_store_ids: [PRANAMI_TARTAM_STORE_ID]
      }
    ]
  };

  const apiRes = await fetch("https://api.openai.com/v1/responses", {
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
      "OpenAI Responses API error (Tartam Compass):",
      apiRes.status,
      errorText
    );
    throw new Error(`OpenAI API error: ${apiRes.status}`);
  }

  const data = await apiRes.json();

  // Responses API: try to pull the first output_text block
  let outputText = "";
  try {
    const firstOutput = data.output && data.output[0];
    const firstContent =
      firstOutput && firstOutput.content && firstOutput.content[0];
    if (firstContent && firstContent.type === "output_text") {
      outputText = firstContent.text || "";
    }
  } catch (err) {
    console.warn("Could not extract output_text from Tartam Compass response:", err);
  }

  if (!outputText || typeof outputText !== "string") {
    throw new Error("Empty model output from Tartam Compass.");
  }

  const parsed = safeJsonParse(outputText, null);
  if (!parsed) {
    throw new Error("Could not parse Tartam Compass JSON output.");
  }

  return {
    verse_snippet: parsed.verse_snippet || "",
    explanation: parsed.explanation || "",
    directive: parsed.directive || ""
  };
}

// ======================================================================
// HTTP handler – /api/chat-pranami
// ======================================================================

export default async function handler(req, res) {
  const start = Date.now();

  // --- Basic CORS (same as other Atma Samvad APIs) ---
  const allowedOrigins = [
    "https://atma-samvad-gita-ashram-frontend.vercel.app",
    "https://samvad.atmavani.life",
    "https://www.atmavani.life"
  ];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      verse_snippet: "",
      explanation: "",
      directive: "",
      meta: {
        error: "Method not allowed",
        elapsedMs: Date.now() - start
      }
    });
  }

  // --- Parse body safely ---
  let body;
  try {
    body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch (err) {
    return res.status(400).json({
      success: false,
      verse_snippet: "",
      explanation: "",
      directive: "",
      meta: {
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
      meta: {
        error: "Question is required",
        elapsedMs: Date.now() - start
      }
    });
  }

  try {
    const result = await callTartamCompassModel(question);

    return res.status(200).json({
      success: true,
      verse_snippet: result.verse_snippet,
      explanation: result.explanation,
      directive: result.directive,
      meta: {
        elapsedMs: Date.now() - start
      }
    });
  } catch (err) {
    console.error("Tartam Compass handler error:", err);
    return res.status(500).json({
      success: false,
      verse_snippet: "",
      explanation: "",
      directive: "",
      meta: {
        error: err.message || "Internal server error",
        elapsedMs: Date.now() - start
      }
    });
  }
}
