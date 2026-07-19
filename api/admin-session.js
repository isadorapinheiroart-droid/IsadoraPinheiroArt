const { verifySession } = require("./auth");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  const user = verifySession(req);
  if (!user) {
    res.status(401).json({ error: "Sessao expirada." });
    return;
  }
  res.status(200).json({ user });
};
