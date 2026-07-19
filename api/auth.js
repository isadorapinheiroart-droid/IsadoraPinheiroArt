const crypto = require("crypto");

const COOKIE_NAME = "atelier_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

function configuredAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    const error = new Error("ADMIN_PASSWORD nao configurado na Vercel.");
    error.statusCode = 503;
    throw error;
  }

  return {
    username: process.env.ADMIN_USER || "admin",
    password,
  };
}

function safeEqual(left, right) {
  const leftHash = crypto.createHash("sha256").update(String(left)).digest();
  const rightHash = crypto.createHash("sha256").update(String(right)).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function signingSecret() {
  return process.env.SESSION_SECRET || configuredAdmin().password;
}

function sign(value) {
  return crypto.createHmac("sha256", signingSecret()).update(value).digest("base64url");
}

function createSession(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Date.now() + SESSION_SECONDS * 1000,
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readCookies(req) {
  return String(req.headers.cookie || "").split(";").reduce((cookies, part) => {
    const separator = part.indexOf("=");
    if (separator === -1) return cookies;
    cookies[part.slice(0, separator).trim()] = decodeURIComponent(part.slice(separator + 1).trim());
    return cookies;
  }, {});
}

function verifySession(req) {
  try {
    const token = readCookies(req)[COOKIE_NAME];
    if (!token) return null;
    const [payload, signature] = token.split(".");
    if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const admin = configuredAdmin();
    if (session.expiresAt <= Date.now() || session.username !== admin.username) return null;
    return { username: session.username, name: "Administrador", role: "admin" };
  } catch {
    return null;
  }
}

function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`,
  );
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

function requireAdmin(req, res) {
  const user = verifySession(req);
  if (!user) {
    res.status(401).json({ error: "Sessao de administrador necessaria." });
    return null;
  }
  return user;
}

module.exports = {
  clearSessionCookie,
  configuredAdmin,
  createSession,
  requireAdmin,
  safeEqual,
  setSessionCookie,
  verifySession,
};
