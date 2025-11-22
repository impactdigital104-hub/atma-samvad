// FILE: api/chat.js
// Real OpenAI-backed backend for Atma Samvad — Sri Aurobindo & The Mother.
//
// Supports two actions (same envelope):
//   1) action: "qa"         → Samvad Q&A (existing behaviour)
//   2) action: "dayReading" → 21-day guided reading passage picker (new)
//
// Envelope (from frontend):
//   {
//     mode: "samvad",
//     guru: "aurobindo",
//     action: "qa" | "dayReading",
//     ...other fields...
//   }

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// For now we hard-code your Sri Aurobindo + The Mother vector store ID.
// Later we can move this into an env var if you prefer.
const SA_VECTOR_STORE_ID = "vs_69171e7134a881918eec0282edbc65ab";

// ---------- Small helpers ----------

function parseBody(req) {
  try {
    if (typeof req.body === "string") {
      return JSON.parse(req.body || "{}");
    }
    return req.body || {};
  } catch {
    return {};
  }
}

// Extracts text from Responses API result.
// Prefer response.output_text, but fall back to walking response.output if needed.
function extractTextFromResponses(result) {
  if (!result) return "";

  if (typeof result.output_text === "string" && result.output_text.trim()) {
    return result.output_text.trim();
  }

  // Fallback: walk result.output[*].content[*].text
  try {
    if (Array.isArray(result.output)) {
      for (const item of result.output) {
        if (!item || !Array.isArray(item.content)) continue;
        for (const part of item.content) {
          if (part && typeof part.text === "string" && part.text.trim()) {
            return part.text.trim();
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return "";
}

// Trim text to a word window (roughly minWords–maxWords).
function clampWords(text, minWords, maxWords) {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";

  const words = cleaned.split(" ");
  if (words.length <= maxWords) {
    return cleaned;
  }
  return words.slice(0, maxWords).join(" ");
}

// ---------- Main handler ----------

module.exports = async (req, res) => {
  // --- CORS headers so frontend on atmavani.life can call this API ---
  res.setHeader("Access-Control-Allow-Origin", "https://www.atmavani.life");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight (browser sends OPTIONS before POST)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Only allow POST for actual work
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const body = parseBody(req);
    const {
      question = "",
      depth = "plain",
      mode,
      guru,
      action,
    } = body;


    // Basic envelope check: must be Samvad + Aurobindo, but allow two actions.
    const isSamvadEnvelope = mode === "samvad" && guru === "aurobindo";
    if (!isSamvadEnvelope) {
      return res.status(400).json({
        error: "Bad request envelope",
        got: { mode, guru, action },
      });
    }

    // Safety: ensure API key present
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return res
        .status(500)
        .json({ error: "Server misconfigured: missing OPENAI_API_KEY" });
    }

    // ---- Branch 1: Q&A (existing behaviour) ----
    if (action === "qa") {
      if (!question.trim()) {
        return res.status(400).json({ error: "Question required" });
      }

      // Style instruction based on depth (plain vs scholar)
      const styleInstruction =
        depth === "scholar"
          ? `
You are answering in SCHOLAR mode.
- Go a bit deeper into Sri Aurobindo's and The Mother's concepts.
- When helpful, mention key ideas like Integral Yoga, the psychic being, transformation of consciousness, evolution, supramental, etc.
- Where fitting, refer to specific works (for example: The Life Divine, The Synthesis of Yoga, Savitri, Letters on Yoga, or The Mother's Prayers and Meditations), but do NOT invent exact page numbers or long quotations.
- Use clear, structured paragraphs and define Sanskrit terms briefly when you use them.
`
          : `
You are answering in PLAIN mode.
- Speak simply and warmly, like a friendly guide.
- Prefer short paragraphs (2–4 lines).
- Avoid heavy jargon; if you use a Sanskrit or technical term, explain it in everyday language.
- Focus on giving a practical, heart-centred explanation that an educated but non-specialist reader can follow.
`;

      // Core system prompt: keep scope narrow and safe
      const baseSystemPrompt = `
You are “Atma Samvad — Sri Aurobindo & The Mother”, a focused spiritual guide for sincere seekers.

Your role
- Help users understand the teachings, life and work of Sri Aurobindo and The Mother, and the path of Integral Yoga.
- Speak as a gentle, knowledgeable teacher: clear, warm, respectful, never preachy or dramatic.
- Always stay grounded in the actual writings and documented conversations of Sri Aurobindo and The Mother, and in well-accepted summaries of Integral Yoga.

Scope and boundaries
- Answer questions that relate to:
  - Sri Aurobindo’s and The Mother’s lives and biographies.
  - Their major works (for example: The Life Divine, The Synthesis of Yoga, Savitri, Essays on the Gita, Letters on Yoga, The Human Cycle, The Ideal of Human Unity, Prayers and Meditations, Questions and Answers, etc.).
  - Core ideas of Integral Yoga (psychic being, Supermind, sadhana in life, aspiration–rejection–surrender, transformation, etc.).
  - Practical guidance as understood from their writings (how to relate to work, relationships, difficulties, inner growth, daily practice).
- It is OK to explain general spiritual concepts (karma, bhakti, meditation, etc.) only when you connect them clearly to the vision of Sri Aurobindo and The Mother.

- Out-of-scope:
  - Do NOT give medical, psychological, legal, financial or professional advice.
  - Do NOT give specific predictions or “fortune-telling”.
  - Do NOT pretend to speak as Sri Aurobindo or The Mother in the first person.
  - Do NOT answer detailed questions about other paths, gurus or religions except briefly and only to contrast or relate back to Integral Yoga.

If a question is out of scope
1. Politely say that the question is outside the present focus of this space.
2. If possible, add 1–2 sentences that gently link back to the view of Sri Aurobindo and The Mother on a related principle.
3. Encourage the user to ask something related to Sri Aurobindo, The Mother, or Integral Yoga.

Depth modes (“plain” vs “scholar”)
The caller passes a depth flag that will be either "plain" or "scholar".

- If depth = "plain" (Simple):
  - Aim for 2–4 short paragraphs.
  - Use everyday language that a newcomer can follow without prior background.
  - Prefer clear explanations and one or two key ideas instead of many technical terms.
  - If you use a Sanskrit or technical term, briefly explain it in simple words.

- If depth = "scholar" (In-depth):
  - Aim for 4–8 paragraphs or a structured answer with headings and bullets when helpful.
  - Go deeper into the philosophical nuances and inner logic of the teaching.
  - Feel free to bring in multiple works and show how they relate to each other.
  - You may quote very short lines (a sentence or less) when really needed, but mostly paraphrase and explain.

Tone and style
- Be clear, kind and balanced. Avoid hype, marketing language or promises.
- You may acknowledge the seeker’s sincerity or difficulty in a simple way (for example: “This is a sincere and important question.”).
- Avoid slang or over-casual language.
- When giving practical guidance, keep it modest and rooted in the teachings (for example: suggest aspiration, quiet reflection, reading certain works, or simple inner attitudes), not extreme actions.

Working with sources
- Whenever you answer, you must internally rely on specific works or well-known collections.
- At the end of the answer, always add a short “Sources” section listing 1–4 relevant works that informed your reply.
- Format it exactly like this:

  Sources:
  - Work or collection name — optional brief hint (e.g. theme or part)
  - Another work name — …

  Examples:
  - The Synthesis of Yoga — especially the chapters on “The Four Aids” and “Self-Consecration”
  - Letters on Yoga — sections on difficulties and the vital nature

- It is okay if the sources are approximate (e.g. work-level rather than exact chapter), but keep them honest and reasonable.

Clarity about limitations
- You do not have perfect or exhaustive knowledge of every line ever written.
- When something is uncertain, say so honestly and answer in a best-effort, reasonable way instead of inventing details.
- If the historical or textual record is unclear or debated, briefly acknowledge that.

Language
- Default to English.
- If the user clearly writes in simple Hindi, you may answer in simple Hindi while keeping the same constraints and style.
- Do not switch languages mid-answer unless the user obviously mixes both.

Overall answering pattern
1. Briefly acknowledge the nature of the question (especially for deep or sensitive questions).
2. Give the main explanation in a clear, logical flow.
3. When helpful, show how different ideas hang together in the larger vision of Integral Yoga.
4. Offer gentle, non-forceful suggestions for inner reflection or practice where appropriate.
5. End with the “Sources” section as specified above.
`.trim();

      const systemPrompt = `${baseSystemPrompt}\n\n${styleInstruction}`;

      const payload = {
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.4,
        max_tokens: 900,
      };

      const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!apiRes.ok) {
        const errorText = await apiRes.text();
        console.error("OpenAI API error (Q&A):", apiRes.status, errorText);
        return res.status(500).json({ error: "Upstream model error" });
      }

      const data = await apiRes.json();
      const rawAnswer = data?.choices?.[0]?.message?.content || "";
      const answer = (rawAnswer || "").trim();

      const sources = [
        "Sri Aurobindo — The Life Divine",
        "Sri Aurobindo — The Synthesis of Yoga",
        "Sri Aurobindo — Savitri",
        "The Mother — Prayers and Meditations",
      ];

      return res.status(200).json({ answer, sources });
    }

    // ---- Branch 2: Day-Reading (new) ----
    if (action === "dayReading") {
      if (!SA_VECTOR_STORE_ID) {
        console.error("SA_VECTOR_STORE_ID is missing (hard-coded or env)");
        return res.status(500).json({
          error: "Day-reading misconfigured: missing vector store id",
        });
      }

      const {
        day = 1,
        phase = "",
        theme = "",
        workHint = "",
        minWords = 60,
        maxWords = 120,
      } = body;

          const instructions = `
You are helping design a 21-day guided journey with short daily readings from Sri Aurobindo and The Mother.

Your task for each request:
- Use FILE SEARCH over the provided vector store that contains authentic works of Sri Aurobindo and The Mother.
- You will be given a "work hint" (for example: "The Synthesis of Yoga", "Letters on Yoga", "The Life Divine", "Prayers and Meditations").
- TREAT THE WORK HINT AS A STRONG PREFERENCE:
  - FIRST, look for passages that clearly come from that specific work or volume.
  - ONLY IF you cannot find a sufficiently relevant passage there, you may fall back to other works in the corpus.
- Select ONE short, self-contained passage (about ${minWords}-${maxWords} words).
- The passage should be directly about the given theme, not a generic explanation.
- Prefer clear, devotional or explanatory passages over very technical or obscure ones.
- Do NOT add any commentary or explanation around the quote.
- Do NOT add a title, introduction, or closing sentence.
- Just return the passage text itself as a continuous paragraph or a few short paragraphs.

If nothing perfectly matches, choose the closest helpful passage you can find (preferably from the hinted work) and still answer with only that passage text.
`.trim();

      const userDescription = `
Please pick one short authentic passage for a guided reading.

Day: ${day}
Phase: ${phase}
Theme: ${theme}
Work hint (strong preference for the source): ${workHint || "(none specified)"}

Instructions:
- First search within the work mentioned in "Work hint" if it matches a known book or volume.
- Only if there is no good match there, broaden to other Sri Aurobindo or Mother works in the vector store.
- Only output the passage text, with no surrounding commentary.
- Aim for roughly ${minWords}-${maxWords} words.
`.trim();

      const payload = {
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: instructions },
          { role: "user", content: userDescription },
        ],
        tools: [
          {
            type: "file_search",
            vector_store_ids: [SA_VECTOR_STORE_ID],
          },
        ],
      };

      const apiRes = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!apiRes.ok) {
        const text = await apiRes.text().catch(() => "");
        console.error("OpenAI API error (Day-Reading):", apiRes.status, text);
        return res.status(500).json({
          error: "Upstream day-reading error",
        });
      }

      const result = await apiRes.json();
      let passageText = extractTextFromResponses(result);
      passageText = clampWords(passageText, minWords, maxWords);

      if (!passageText) {
        console.error("Day-Reading: no passage text extracted from Responses");
        return res.status(500).json({
          error: "Day-reading failed to extract passage",
        });
      }

      // For now, we return simple metadata; frontend already uses its own 'work' text.
      const payloadOut = {
        ok: true,
        guruId: "sri-aurobindo",
        day,
        passage: {
          text: passageText,
          work: workHint || "Sri Aurobindo & The Mother",
          section: null,
          sourceId: null,
        },
      };

      return res.status(200).json(payloadOut);
    }

    // If we reach here, action is unknown.
    return res.status(400).json({
      error: "Unknown action",
      got: { action },
    });
  } catch (e) {
    console.error("api/chat error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
};
