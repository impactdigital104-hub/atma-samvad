// FILE: api/chat.js
// Temporary stub so Q&A UI works end-to-end on samvad.atmavani.life.
// Later, replace with real OpenAI + citations OR re-introduce a rewrite to your main backend.

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    let body = {};
    try { body = req.body || {}; } catch { body = {}; }

    const { question = "", depth = "plain", mode, guru, action } = body;

    // very light validation
    if (mode !== "samvad" || guru !== "aurobindo" || action !== "qa") {
      return res.status(400).json({ error: "Bad request envelope", got: { mode, guru, action } });
    }
    if (!question.trim()) {
      return res.status(400).json({ error: "Question required" });
    }

    // Demo answer (stub). Replace later with real model call and retrieved sources.
    const answer =
      depth === "scholar"
        ? `Scholarly note: Sri Aurobindo (1872–1950) was a philosopher, poet, and yogi. His major works include *The Life Divine*, *Synthesis of Yoga*, and *Savitri*. Your question: “${question}”. In a full build, this would be grounded with citations to the Collected Works.`
        : `Sri Aurobindo was a modern sage and philosopher who wrote about yoga, evolution of consciousness, and India's spiritual destiny. Your question was: “${question}”. (This is a demo answer.)`;

    const sources = [
      "Collected Works of Sri Aurobindo — The Life Divine",
      "Collected Works of Sri Aurobindo — Synthesis of Yoga",
      "Savitri — A Legend and a Symbol"
    ];

    return res.status(200).json({ answer, sources });
  } catch (e) {
    console.error("api/chat error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
