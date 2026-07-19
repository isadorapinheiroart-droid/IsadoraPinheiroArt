const { database, ensureStateTable } = require("./db");
const { calculateShipping } = require("./shipping-service");

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

function setCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  const requestOrigin = req.headers.origin;
  const origin = allowedOrigin === "*" ? "*" : requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

async function cartSummary(clientItems) {
  await ensureStateTable();
  const db = database();
  const rows = await db`
    select value
    from atelier_state
    where key = 'products'
    limit 1
  `;
  const products = Array.isArray(rows[0]?.value) ? rows[0].value : [];
  const byId = new Map(products.map((product) => [String(product.id), product]));

  return clientItems.reduce((summary, item) => {
    const product = byId.get(String(item?.id));
    const quantity = Math.max(1, Math.min(Number.parseInt(item?.quantity, 10) || 1, 10));
    if (!product || Number(product.stock) <= 0 || Number(product.price) <= 0) {
      const error = new Error("Uma das obras do carrinho nao esta disponivel.");
      error.statusCode = 400;
      throw error;
    }
    summary.itemCount += quantity;
    summary.subtotal += Number(product.price) * quantity;
    return summary;
  }, { itemCount: 0, subtotal: 0 });
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = getBody(req);
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      res.status(400).json({ error: "Adicione uma obra ao carrinho antes de calcular o frete." });
      return;
    }
    const summary = await cartSummary(items);
    const quote = await calculateShipping({
      postalCode: body.postalCode,
      itemCount: summary.itemCount,
      subtotal: summary.subtotal,
    });
    res.status(200).json(quote);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || "Erro ao calcular frete." });
  }
};
