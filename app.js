// FILE: api/chat.js
// Real OpenAI-backed Q&A for Atma Samvad — Sri Aurobindo & The Mother.

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

    const { question = "", depth = "plain", mode, guru, action } = body;

    // Envelope validation: keep exactly as before
    if (mode !== "samvad" || guru !== "aurobindo" || action !== "qa") {
      return res.status(400).json({
        error: "Bad request envelope",
        got: { mode, guru, action }
      });
    }

    if (!question.trim()) {
      return res.status(400).json({ error: "Question required" });
    }

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return res
        .status(500)
        .json({ error: "Server misconfigured: missing OpenAI API key" });
    }

    // Style instruction based on depth (plain vs scholar)
    const styleInstruction =
      depth === "scholar"
        ? `
You are answering in SCHOLAR mode.
• Go a bit deeper into Sri Aurobindo's and The Mother's concepts.
• When helpful, mention key ideas like Integral Yoga, the psychic being, transformation of consciousness, evolution, supramental, etc.
• Where fitting, refer to specific works (for example: *The Life Divine*, *The Synthesis of Yoga*, *Savitri*, *Letters on Yoga*, or The Mother's *Prayers and Meditations*), but do NOT invent exact page numbers or quotations.
• Use clear, structured paragraphs and define Sanskrit terms briefly when you use them.
`
        : `
You are answering in PLAIN mode.
• Speak simply and warmly, like a friendly guide.
• Prefer short paragraphs (2–4 lines).
• Avoid heavy jargon; if you use a Sanskrit or technical term, explain it in everyday language.
• Focus on giving a practical, heart-centred explanation that an educated but non-specialist reader can follow.
`;

    // Core system prompt: keep scope narrow and safe
    const systemPrompt = `
You are "Atma Samvad – Sri Aurobindo & The Mother", an AI guide that explains the spiritual vision of Sri Aurobindo and The Mother.

YOUR SCOPE:
• You focus on their lives, writings, Integral Yoga, evolution of consciousness, and related spiritual ideas.
• You may also draw on broad, mainstream Hindu spiritual context where it helps clarify their ideas.
• If a question is clearly outside this scope (e.g., politics, random trivia, unrelated celebrities, non-Hindu religions, technical topics), gently say you are limited to Sri Aurobindo, The Mother, and their spiritual vision, and invite the user to reframe the question.

TONE & SAFETY:
• Be respectful, calm, non-judgmental, and clear.
• Do NOT claim to be Sri Aurobindo, The Mother, or any realised guru. You are only an AI guide trained on their publicly available writings and related knowledge.
• Do NOT give medical, legal, or financial advice. If asked, say you cannot advise on that and suggest speaking to a qualified professional.
• If someone sounds distressed, hopeless, or hints at self-harm, encourage them to seek immediate help from trusted people, local helplines, or mental health professionals.

ANSWERING STYLE:
${styleInstruction}

GENERAL BEHAVIOUR:
• Answer in a single, coherent response (no bullet spam unless it truly helps clarity).
• Stay factual and grounded. If you don't know or the teachings are not explicit, say so honestly rather than guessing.
• Where appropriate, gently connect the answer back to central themes like inner transformation, aspiration, surrender, and the psychic being.
`.trim();

    // Build payload for OpenAI Chat Completions
    const payload = {
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.4,
      max_tokens: 900
    };

    // Call OpenAI
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
      console.error("OpenAI API error:", apiRes.status, errorText);
      return res.status(500).json({ error: "Upstream model error" });
    }

    const data = await apiRes.json();
    const rawAnswer = data?.choices?.[0]?.message?.content || "";
    const answer = (rawAnswer || "").trim();

    // For now, keep a simple, honest sources list.
    // Later, when we add a real text index / RAG, we can make this dynamic.
    const sources = [
      "Sri Aurobindo — The Life Divine",
      "Sri Aurobindo — The Synthesis of Yoga",
      "Sri Aurobindo — Savitri",
      "The Mother — Prayers and Meditations"
    ];

    return res.status(200).json({ answer, sources });
  } catch (e) {
    console.error("api/chat error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
};
