// api/chat-pranami.js
// Pranami Tartam Ashram – Tartam Vidya Compass backend
//
// STRICT MODE VERSION
// - Uses ONLY the Pranami Tartam vector store via file_search
// - If file_search / Responses API fails, we DO NOT fall back to generic AI
// - Returns meta.usedVectorStore + meta.error so frontend can debug

const PRANAMI_VECTOR_STORE_ID = "vs_6932802f55848191b75d5e57cbebda8d";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Small helper to parse the Responses API output into our JSON object
function extractJsonFromResponseBody(body) {
  // body.output[0].content[0].text should contain our JSON (because we use json_schema)
  if (!body || !Array.isArray(body.output) || body.output.length === 0) {
    throw new Error("No output array in Responses API result");
  }

  const firstOutput = body.output[0];
  if (
    !firstOutput.content ||
    !Array.isArray(firstOutput.content) ||
    firstOutput.content.length === 0
  ) {
    throw new Error("No content array in first output item");
  }

  const firstContent = firstOutput.content[0];

  // In newer SDKs this might be called output_text, but via raw REST we get text
  const text = firstContent.text || firstContent.output_text || "";
  if (!text) {
    throw new Error("No text field in first content item");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON from model:", text);
    throw new Error("Model did not return valid JSON");
  }

  return parsed;
}

async function callTartamWithVectorStore(question) {
  const systemPrompt = `
You are "Tartam Vidya Compass" – a spiritual reflection assistant rooted ONLY in
the Pranami Tartam / Beetak teachings.

Your job:
- Listen to a real-life situation from the user.
- Search the Pranami Tartam vector store for relevant passages/themes.
- Offer a short, kind reflection that feels like it flows from Tartam teachings,
  not generic self-help.

You MUST base your guidance on the uploaded Tartam materials.
If they are not relevant or not sufficient, say clearly:
"I’m not able to find a clear Tartam teaching for this question."

Return your answer as STRICT JSON (no extra text around it) in this format:

{
  "verse_snippet": "one or two lines capturing the essence",
  "explanation": "3–6 short paragraphs explaining the guidance in simple language",
  "directive": "A numbered or bulleted list with 3–6 simple, practical steps for daily life"
}
`;

  const userPrompt = `
User situation (plain language):

"${question}"
`;

  const payload = {
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    tools: [
      {
        type: "file_search"
      }
    ],
    // IMPORTANT: correctly attach the vector store here
    tool_resources: {
      file_search: {
        vector_store_ids: [PRANAMI_VECTOR_STORE_ID]
      }
    },
    // Ask the model to output STRICT JSON in the shape we want
    response_format: {
      type: "json_schema",
      json_schema: {
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
        }
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
    console.error("OpenAI Responses API error:", apiRes.status, body);
    // surface the error message so we can see it on the frontend
    throw new Error(
      body.error?.message ||
        `OpenAI Responses API failed with status ${apiRes.status}`
    );
  }

  // If output_text exists (SDK-style), we can try to parse that first
  if (body.output_text) {
    try {
      return JSON.parse(body.output_text);
    } catch {
      // fall through to manual extraction
    }
  }

  // Manual extraction from output[0].content[0].text
  return extractJsonFromResponseBody(body);
}

export default async function handler(req, res) {
  const start = Date.now();

  // --- CORS (same pattern as Gita APIs) ---
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

  const { question } = req.body || {};
  if (!question || typeof question !== "string") {
    return res.status(400).json({
      success: false,
      error: "Missing 'question' in request body",
      meta: { usedVectorStore: false, elapsedMs: Date.now() - start }
    });
  }

  try {
    const result = await callTartamWithVectorStore(question);

    return res.status(200).json({
      success: true,
      verse_snippet: result.verse_snippet,
      explanation: result.explanation,
      directive: result.directive,
      meta: {
        usedVectorStore: true,
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
