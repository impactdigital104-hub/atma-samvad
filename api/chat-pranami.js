// api/chat-pranami.js
// Pranami Tartam Ashram – backend for /api/chat-pranami
//
// Tartam Vidya Compass:
// - User sends a single "question" (their worry / situation)
// - We call OpenAI Responses API with file_search over Tartam vector store
// - We expect a JSON reply with { verse_snippet, explanation, directive }

const PRANAMI_TARTAM_STORE_ID = "vs_6932802f55848191b75d5e57cbebda8d";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ------------------------------------------------------------
// Helper: call OpenAI Responses API for Tartam Compass
// ------------------------------------------------------------

async function callTartamCompassModel(question) {
  if (!OPENAI_API_KEY || !PRANAMI_TARTAM_STORE_ID) {
    console.error(
      "Missing OPENAI_API_KEY or PRANAMI_TARTAM_STORE_ID for Tartam Compass"
    );
    return {
      verse_snippet: "",
      explanation:
        "Tartam Vidya Compass is temporarily unavailable because the server is not fully configured.",
      directive: ""
    };
  }

  const inputText = `
You are "Tartam Vidya Compass", a gentle spiritual guide of the Pranami (Nijananda) sampradaya.

The user will share a worry, confusion, or life situation.

You MUST:
- Use the Tartam / Beetak texts available via file_search as your main source.
- Never invent or fabricate Sanskrit verses. Only quote or paraphrase what is actually present in the retrieved context.
- Speak in a calm, kind, non-judgmental tone.

Return your answer ONLY as a JSON object with EXACTLY these three keys:

{
  "verse_snippet": "A short excerpt or summary line from the retrieved Tartam / Beetak context that is most relevant to the user's worry.",
  "explanation": "3–6 sentences in simple, warm language, explaining how this verse relates to the user's worry. You may gently mention concepts like mohajal, surat, prema, etc. only if they arise naturally from the retrieved text.",
  "directive": "1–2 gentle, practical lines suggesting how the user can hold this teaching in their heart or daily life. Keep it simple and non-dogmatic."
}

Do NOT add any extra text outside this JSON. No markdown, no commentary.

User's worry:

"${question}"
`.trim();

  const payload = {
    model: "gpt-4.1-mini",
    input: inputText,
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
    const errText = await apiRes.text().catch(() => "");
    console.error(
      "OpenAI Responses API error (Tartam Compass):",
      apiRes.status,
      errText
    );
    return {
      verse_snippet: "",
      explanation:
        "Tartam Vidya Compass could not reach the wisdom engine just now. Please try again in a little while.",
      directive: ""
    };
  }

  const data = await apiRes.json();

  // Extract plain text from Responses API structure, same pattern as chat-gita.js
  let outputText = "";
  try {
    const firstOutput = data.output && data.output[0];
    const firstContent =
      firstOutput && firstOutput.content && firstOutput.content[0];
    if (firstContent && firstContent.type === "output_text") {
      outputText = firstContent.text || "";
    }
  } catch (extractErr) {
    console.warn(
      "Could not extract output_text from Tartam Compass response:",
      extractErr
    );
  }

  if (!outputText) {
    return {
      verse_snippet: "",
      explanation:
        "Tartam Vidya Compass did not return a clear answer this time. Please try asking again in slightly different words.",
      directive: ""
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(outputText);
  } catch (parseErr) {
    console.warn("Could not parse Tartam Compass JSON:", parseErr);
    // Fallback: wrap entire text as explanation so user at least sees something
    return {
      verse_snippet: "",
      explanation: outputText,
      directive: ""
    };
  }

  return {
    verse_snippet:
      parsed.verse_snippet || parsed.verseSnippet || parsed.verse || "",
    explanation: parsed.explanation || "",
    directive: parsed.directive || ""
  };
}

// ------------------------------------------------------------
// HTTP handler
// ------------------------------------------------------------

export default async function handler(req, res) {
  const start = Date.now();

  // --- Basic CORS setup (same pattern as chat-gita.js) ---
  const allowedOrigins = [
    "https://atma-samvad-gita-ashram-frontend.vercel.app",
    "https://samvad.atmavani.life",
    "https://www.atmavani.life"
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://atma-samvad-gita-ashram-frontend.vercel.app"
    );
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  // Parse JSON body safely (same pattern as chat-gita.js)
  let body;
  try {
    body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON body"
    });
  }

  const question = (body.question || "").trim();

  if (!question) {
    return res.status(400).json({
      success: false,
      error:
        "Please share your worry or situation in the 'question' field so the Tartam Vidya Compass can respond."
    });
  }

  try {
    const result = await callTartamCompassModel(question);

    return res.status(200).json({
      success: true,
      verse_snippet: result.verse_snippet || "",
      explanation: result.explanation || "",
      directive: result.directive || "",
      meta: {
        elapsedMs: Date.now() - start
      }
    });
  } catch (err) {
    console.error("Tartam Compass handler error:", err);
    return res.status(500).json({
      success: false,
      error:
        "Tartam Vidya Compass encountered an unexpected error. Please try again later."
    });
  }
}
