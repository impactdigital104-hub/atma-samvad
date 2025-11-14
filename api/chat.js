// FILE: api/chat.js
// Real OpenAI-backed Q&A + Day-Reading for Atma Samvad — Sri Aurobindo & The Mother.

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// This is your Sri Aurobindo vector store (The Synthesis of Yoga + Essays on the Gita, for now).
const SRI_AUROBINDO_VECTOR_STORE_ID = "vs_69171e7134a881918eec0282edbc65ab";

module.exports = async (req, res) => {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Parse body safely (handles both JSON and already-parsed objects)
    let body = {};
    try {
      body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : (req.body || {});
    } catch {
      body = {};
    }

    const { mode, guru, action } = body;

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return res
        .status(500)
        .json({ error: "Server misconfigured: missing OPENAI_API_KEY" });
    }

    // ---- BRANCH 1: Existing Q&A mode (unchanged contract) -------------------
    if (mode === "samvad" && guru === "aurobindo" && action === "qa") {
      const { question = "", depth = "plain" } = body;

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

      // Combine base prompt with depth-specific instruction
      const systemPrompt = `${baseSystemPrompt}\n\n${styleInstruction}`;

      // Build payload for OpenAI Chat Completions (Q&A)
      const payload = {
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.4,
        max_tokens: 900
      };

      const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!apiRes.ok) {
        const errorText = await apiRes.text();
        console.error("OpenAI API error (Q&A):", apiRes.status, errorText);
        return res.status(500).json({ error: "Upstream model error" });
      }

      const data = await apiRes.json();
      const rawAnswer = data?.choices?.[0]?.message?.content || "";
      const answer = (rawAnswer || "").trim();

      // Static sources list (for now)
      const sources = [
        "Sri Aurobindo — The Life Divine",
        "Sri Aurobindo — The Synthesis of Yoga",
        "Sri Aurobindo — Savitri",
        "The Mother — Prayers and Meditations"
      ];

      return res.status(200).json({ answer, sources });
    }

    // ---- BRANCH 2: New Day-Reading mode (with vector store) -----------------
    if (mode === "dayReading") {
      const {
        guruId = "sri-aurobindo",
        day,
        phase = "",
        theme = "",
        workHint = "",
        minWords = 60,
        maxWords = 120
      } = body;

      if (!day || !Number.isInteger(day)) {
        return res.status(400).json({ error: "Valid 'day' (integer) is required" });
      }

      if (!theme || !theme.trim()) {
        return res.status(400).json({ error: "A 'theme' string is required" });
      }

      const safeMin = Math.max(30, Number(minWords) || 60);
      const safeMax = Math.max(safeMin + 10, Number(maxWords) || 120);

      // System instructions for Responses API + file_search
      const dayReadingInstructions = `
You are “Atma Samvad — Sri Aurobindo & The Mother”, generating a SINGLE short reading passage for a 21-day guided journey in Integral Yoga.

You have access to a file_search tool connected to a vector store that contains works of Sri Aurobindo and The Mother (including "The Synthesis of Yoga" and "Essays on the Gita").

Your task in this mode:
- Use file_search to ground yourself in the actual texts from this vector store.
- Pick ONE short, representative passage that fits the given theme.
- Prefer a direct quote or a very close paraphrase based on the retrieved text.
- Target length: between ${safeMin} and ${safeMax} words.
- Do NOT exceed ${safeMax + 20} words under any circumstance.

Priorities:
- Faithfulness to the actual thought and tone of Sri Aurobindo / The Mother.
- Clarity and accessibility for a sincere seeker who may be new to Integral Yoga.
- If possible, choose passages from the suggested work hint (for example, "The Synthesis of Yoga") but it is okay to draw from the other uploaded works when they fit the theme.

Output format:
- You MUST return a single JSON object ONLY, no extra text, in this exact shape:

  {
    "text": "…the ${safeMin}-${safeMax} word passage…",
    "work": "…book or collection name…",
    "section": "…chapter / canto / talk / context, if known, else an empty string…"
  }

Rules:
- Do NOT include any commentary or explanation in "text" — only the passage itself, as a flowing paragraph.
- Do NOT invent precise page numbers.
- If you are not sure of the exact section title, use a reasonable high-level label (e.g. "Early chapters on the aim of the yoga").
`.trim();

      const userDescription = `
Please select one short passage for day ${day} of a 21-day Integral Yoga journey.

Guru ID: ${guruId}
Phase: ${phase || "n/a"}
Theme: ${theme}
Work hint: ${workHint || "any suitable work of Sri Aurobindo or The Mother"}

Remember:
- Length between ${safeMin} and ${safeMax} words.
- Output ONLY a JSON object with keys: text, work, section.
`.trim();

      // Build payload for Responses API with file_search tool
      const payload = {
        model: "gpt-4.1-mini",
        instructions: dayReadingInstructions,
        input: userDescription,
        tools: [
          {
            type: "file_search",
            vector_store_ids: [SRI_AUROBINDO_VECTOR_STORE_ID]
          }
        ],
        temperature: 0.3,
        max_tokens: 500
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
        const errorText = await apiRes.text();
        console.error("OpenAI API error (Day-Reading):", apiRes.status, errorText);
        return res.status(500).json({ error: "Upstream model error (dayReading)" });
      }

      const data = await apiRes.json();
      const raw = (data?.output_text || "").trim();

      let passageObj;
      try {
        passageObj = JSON.parse(raw);
      } catch {
        // Fallback: if model didn't give clean JSON, wrap as text-only
        passageObj = {
          text: raw,
          work: "Sri Aurobindo / The Mother",
          section: ""
        };
      }

      const passage = {
        text: String(passageObj.text || "").trim(),
        work: String(passageObj.work || "Sri Aurobindo / The Mother").trim(),
        section: String(passageObj.section || "").trim(),
        // Placeholder: we are not yet surfacing the low-level file/chunk ID.
        sourceId: null
      };

      return res.status(200).json({
        ok: true,
        day,
        guruId,
        passage
      });
    }

    // ---- Fallback: unknown envelope ----------------------------------------
    return res.status(400).json({
      error: "Bad request envelope",
      got: { mode, guru, action }
    });
  } catch (e) {
    console.error("api/chat error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
};
