// api/chat-pranami.js
// Pranami Tartam Ashram – backend for /api/chat-pranami
//
// Takes a real-life question from the user and returns:
//
// {
//   success: true,
//   verse_snippet: "...",
//   explanation: "...",
//   directive: "...",
//   meta: {...}
// }
//
// It first tries File Search over the Pranami Tartam vector store.
// If that fails for ANY reason, it falls back to a plain LLM call
// (no vector store) so the user still gets guidance.

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PRANAMI_TARTAM_STORE_ID = "vs_6932802f55848191b75d5e57cbebda8d";

// --------- small helper ----------
function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// --------- core model call with optional file_search ----------
async function callTartamCompassModel(question) {
  if (!OPENAI_API_KEY) {
    // If key is somehow missing on this project, fail clearly but safely
    return {
      verse_snippet: "",
      explanation:
        "The Tartam Vidya Compass is temporarily unavailable due to a configuration issue. Please try again a little later.",
      directive: "",
      meta: {
        usedVectorStore: false,
        error: "OPENAI_API_KEY missing on server."
      }
    };
  }

  const systemPrompt = `
You are the Tartam Vidya Compass inside the Pranami Tartam Ashram of Atma Samvad.

Your role:
- Listen very gently to the user's real-life situation.
- Draw on Pranami Tartam / Beetak teachings where available.
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
If Tartam sources are unclear, still answer gently in the Pranami spirit,
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

  // ---------- 1st attempt: WITH Tartam vector store ----------
  let usedVectorStore = false;
  let outputText = "";
  let lastError = null;

  if (PRANAMI_TARTAM_STORE_ID) {
    try {
      const payloadWithStore = {
        model: "gpt-4.1-mini",
        input: `${systemPrompt}\n\n---\n\n${userPrompt}`,
        tools: [
          {
            type: "file_search",
            vector_store_ids: [PRANAMI_TARTAM_STORE_ID],
            // you can tweak these later if needed
            max_num_results: 8
          }
        ]
      };

      const apiRes = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(payloadWithStore)
      });

      if (!apiRes.ok) {
        const errorText = await apiRes.text().catch(() => "");
        console.error(
          "OpenAI Responses API error (Tartam Compass WITH vector store):",
          apiRes.status,
          errorText
        );
        lastError = `OpenAI error (with store): ${apiRes.status} ${errorText}`;
      } else {
        const data = await apiRes.json();

        try {
          const firstOutput = data.output && data.output[0];
          const firstContent =
            firstOutput && firstOutput.content && firstOutput.content[0];
          if (firstContent && firstContent.type === "output_text") {
            outputText = firstContent.text || "";
          }
        } catch (extractErr) {
          console.warn(
            "Could not extract output_text from Tartam Compass (with store):",
            extractErr
          );
          lastError = `extract_output_error: ${extractErr.message || String(
            extractErr
          )}`;
        }

        usedVectorStore = !!outputText;
      }
    } catch (err) {
      console.error("Exception calling Tartam Compass WITH vector store:", err);
      lastError = `exception_with_store: ${err.message || String(err)}`;
    }
  }

  // ---------- 2nd attempt: fallback WITHOUT vector store ----------
  if (!outputText) {
    try {
      const payloadFallback = {
        model: "gpt-4.1-mini",
        input: `${systemPrompt}\n\n---\n\n${userPrompt}`
      };

      const apiRes2 = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(payloadFallback)
      });

      if (!apiRes2.ok) {
        const errorText2 = await apiRes2.text().catch(() => "");
        console.error(
          "OpenAI Responses API error (Tartam Compass FALLBACK no store):",
          apiRes2.status,
          errorText2
        );
        lastError = `OpenAI error (no store): ${apiRes2.status} ${errorText2}`;
      } else {
        const data2 = await apiRes2.json();

        try {
          const firstOutput = data2.output && data2.output[0];
          const firstContent =
            firstOutput && firstOutput.content && firstOutput.content[0];
          if (firstContent && firstContent.type === "output_text") {
            outputText = firstContent.text || "";
          }
        } catch (extractErr2) {
          console.warn(
            "Could not extract output_text from Tartam Compass fallback:",
            extractErr2
          );
          lastError = `extract_output_error_fallback: ${
            extractErr2.message || String(extractErr2)
          }`;
        }
      }
    } catch (err2) {
      console.error("Exception in Tartam Compass FALLBACK call:", err2);
      lastError = `exception_no_store: ${err2.message || String(err2)}`;
    }
  }

  // ---------- final parsing ----------
  if (!outputText) {
    // Absolute fallback: return a safe generic reflection
    return {
      verse_snippet: "",
      explanation:
        "I was not able to reach the Tartam Vidya guidance system just now. Please sit quietly with your question for a few breaths, and try again after some time.",
      directive:
        "You might write your situation in a journal and offer it inwardly to the Supreme. When the Compass is available again, you can return and ask once more.",
      meta: {
        usedVectorStore,
        error: lastError || "no_output_text"
      }
    };
  }

  const parsed = safeJsonParse(outputText, null);
  if (!parsed) {
    return {
      verse_snippet: "",
      explanation:
        "I could not clearly structure the guidance just now. Please try once more in a little while.",
      directive: "",
      meta: {
        usedVectorStore,
        error: "json_parse_failed",
        raw: outputText.slice(0, 4000)
      }
    };
  }

  return {
    verse_snippet: parsed.verse_snippet || "",
    explanation: parsed.explanation || "",
    directive: parsed.directive || "",
    meta: {
      usedVectorStore,
      error: lastError || null
    }
  };
}

// ======================================================================
// HTTP handler – /api/chat-pranami
// ======================================================================

export default async function handler(req, res) {
  const start = Date.now();

  // --- Basic CORS (aligned with other Atma Samvad APIs) ---
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

  // --- Parse JSON body safely ---
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
        ...(result.meta || {}),
        elapsedMs: Date.now() - start
      }
    });
  } catch (err) {
    console.error("Tartam Compass handler unexpected error:", err);
    return res.status(200).json({
      success: true,
      verse_snippet: "",
      explanation:
        "The Tartam Vidya Compass ran into an unexpected problem while responding. Please try again in a little while.",
      directive: "",
      meta: {
        error: err.message || "handler_exception",
        elapsedMs: Date.now() - start
      }
    });
  }
}
