// FILE: api/health.js
// CommonJS handler for Vercel Serverless Function

module.exports = async function handler(req, res) {
  res.status(200).json({ ok: true, project: "atma-samvad", ts: Date.now() });
};
