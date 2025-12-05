// api/chat-pranami.js
// STRICT Tartam Vidya Compass backend using Responses API + text.format
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
You are "Tartam Vidya Compass" – a spiritual reflection assistant rooted in
the Pranami Tartam / Beetak teachings.

Your job:
- Listen to a real-life situation from the user.
- Use file_search on the Pranami Tartam corpus to find relevant passages and themes.
- Offer a short, kind reflection that feels aligned with Tartam teachings,
  not generic self-help.

If the Tartam sources are unclear or not sufficient, say gently:
"I’m not able to find a clear Tartam teaching for this question."

You MUST output a single JSON object ONLY (no extra text) with:

{
  "verse_snippet": "one or two lines capturing the essence",
  "explanation": "3–6 short paragraphs explaining the guidance in simple language",
  "directive": "A numbered or bulleted list with 3–6 simple, practical steps for daily life"
}
`.trim();

  const userPrompt = `
User's situation:

"${question}"
`.trim();

  const payload = {
    model: "gpt-4.1-mini",
    // We send one combined text input (system + user)
    input: `${systemPrompt}\n\n---\n\n${userPrompt}`,

    // Attach Tartam vector store as a file_search tool
    tools: [
      {
        type: "file_search"
      }
    ],
    tool_resources: {
      file_search: {
        vector_store_ids: [PRANAMI_VECTOR_STORE_ID]
      }
    },

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

  // If output_text is missing, fall back to output[0].content[0].text
  if (!raw && Array.isArray(body.output) && body.output.length > 0) {
    const first = body.output[0];
    if (
      first.content &&
      Array.isArray(first.content) &&
      first.content.length > 0
    ) {
      raw = first.content[0].text || "";
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
