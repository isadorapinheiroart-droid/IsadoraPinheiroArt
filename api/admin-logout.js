const { clearSessionCookie } = require("./auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
};
