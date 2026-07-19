const { database, ensureStateTable } = require("./db");

const allowedKeys = new Set([
  "products",
  "hero-settings",
  "site-settings",
]);

function setCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  const requestOrigin = req.headers.origin;
  const origin = allowedOrigin === "*" ? "*" : requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin;

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

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

function getKey(req) {
  const url = new URL(req.url, "https://isadora-pinheiro-art.vercel.app");
  return url.searchParams.get("key");
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const key = getKey(req);
  if (!allowedKeys.has(key)) {
    res.status(400).json({ error: "Chave de estado invalida." });
    return;
  }

  try {
    await ensureStateTable();
    const db = database();

    if (req.method === "GET") {
      const rows = await db`
        select value
        from atelier_state
        where key = ${key}
        limit 1
      `;

      res.status(200).json({
        key,
        value: rows[0]?.value ?? null,
      });
      return;
    }

    if (req.method === "PUT") {
      const body = getBody(req);

      await db`
        insert into atelier_state (key, value, updated_at)
        values (${key}, ${db.json(body.value ?? null)}, now())
        on conflict (key)
        do update set value = excluded.value, updated_at = now()
      `;

      res.status(200).json({ ok: true, key });
      return;
    }

    res.status(405).json({ error: "Metodo nao permitido." });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || "Erro ao acessar banco de dados.",
    });
  }
};
