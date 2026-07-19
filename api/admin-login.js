const {
  configuredAdmin,
  createSession,
  safeEqual,
  setSessionCookie,
} = require("./auth");

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = getBody(req);
    const admin = configuredAdmin();
    if (!safeEqual(body.username || "", admin.username) || !safeEqual(body.password || "", admin.password)) {
      res.status(401).json({ error: "Usuario ou senha incorretos." });
      return;
    }

    setSessionCookie(res, createSession(admin.username));
    res.status(200).json({ user: { username: admin.username, name: "Administrador", role: "admin" } });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || "Nao foi possivel entrar." });
  }
};
