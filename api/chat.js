// FILE: api/chat.js
// Temporary stub so Q&A UI works end-to-end on samvad.atmavani.life.
// CommonJS handler for Vercel Serverless Function.

module.exports = async function handler(req, res) {
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

    // Demo answer (stub). Replace later with real model + citations.
    const answer =
      depth === "scholar"
        ? `Scholarly note: Sri Aurobindo (1872–1950) was a philosopher, poet, and yogi. His major works include "The Life Divine", "The Synthesis of Yoga", and "Savitri". Your question: “${question}”. (Demo answer)`
        : `Sri Aurobindo was a modern sage and philosopher who wrote about yoga, the evolution of consciousness, and India's spiritual destiny. Your question was: “${question}”. (Demo answer)`;

    const sources = [
      "Collected Works of Sri Aurobindo — The Life Divine",
      "Collected Works of Sri Aurobindo — The Synthesis of Yoga",
      "Savitri — A Legend and a Symbol"
    ];

    return res.status(200).json({ answer, sources });
  } catch (e) {
    console.error("api/chat error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
};
