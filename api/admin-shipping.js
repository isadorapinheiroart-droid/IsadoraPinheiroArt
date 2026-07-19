const { requireAdmin } = require("./auth");
const { database, ensureStateTable } = require("./db");
const {
  defaultShippingSettings,
  loadShippingSettings,
  normalizeShippingSettings,
} = require("./shipping-service");

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
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      const settings = await loadShippingSettings();
      res.status(200).json({ settings: settings || defaultShippingSettings });
      return;
    }

    if (req.method === "PUT") {
      const settings = normalizeShippingSettings(getBody(req).settings);
      await ensureStateTable();
      const db = database();
      await db`
        insert into atelier_state (key, value, updated_at)
        values ('shipping-settings', ${db.json(settings)}, now())
        on conflict (key)
        do update set value = excluded.value, updated_at = now()
      `;
      res.status(200).json({ ok: true, settings });
      return;
    }

    res.status(405).json({ error: "Metodo nao permitido." });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || "Erro ao salvar configuracao de frete." });
  }
};
