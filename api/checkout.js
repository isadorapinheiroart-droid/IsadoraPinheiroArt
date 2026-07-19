const MERCADO_PAGO_PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";
const { database, ensureStateTable } = require("./db");

function setCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  const requestOrigin = req.headers.origin;
  const origin = allowedOrigin === "*" ? "*" : requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin;

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalizeItem(item) {
  const title = String(item?.title || "").trim().slice(0, 120);
  const unitPrice = Number(item?.unit_price);
  const quantity = Number.parseInt(item?.quantity, 10) || 1;

  if (!title || !Number.isFinite(unitPrice) || unitPrice <= 0) return null;

  return {
    id: String(item?.id || title).slice(0, 64),
    title,
    quantity: Math.max(1, Math.min(quantity, 10)),
    unit_price: Number(unitPrice.toFixed(2)),
    currency_id: "BRL",
  };
}

function getRequestBody(req) {
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

async function loadProductsForCheckout() {
  if (!process.env.DATABASE_URL) return null;

  await ensureStateTable();
  const db = database();
  const rows = await db`
    select value
    from atelier_state
    where key = 'products'
    limit 1
  `;

  return Array.isArray(rows[0]?.value) ? rows[0].value : [];
}

async function protectPricesWithDatabase(clientItems) {
  const databaseProducts = await loadProductsForCheckout();
  if (!databaseProducts) return clientItems;

  const byId = new Map(databaseProducts.map((product) => [String(product.id), product]));
  return clientItems.map((item) => {
    const product = byId.get(String(item.id));
    const quantity = Number.parseInt(item.quantity, 10) || 1;

    const unitPrice = Number(product.price || 0);

    if (!product || Number(product.stock) <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      const error = new Error("Uma das obras do carrinho nao esta disponivel.");
      error.statusCode = 400;
      throw error;
    }

    return {
      id: String(product.id).slice(0, 64),
      title: String(product.title || "Obra").slice(0, 120),
      quantity: Math.max(1, Math.min(quantity, 10)),
      unit_price: Number(unitPrice.toFixed(2)),
      currency_id: "BRL",
    };
  });
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

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: "MP_ACCESS_TOKEN nao configurado no servidor." });
    return;
  }

  const body = getRequestBody(req);
  let items = Array.isArray(body.items)
    ? body.items.map(normalizeItem).filter(Boolean)
    : [];

  if (!items.length) {
    res.status(400).json({ error: "Carrinho vazio ou invalido." });
    return;
  }

  try {
    items = await protectPricesWithDatabase(items);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
    return;
  }

  const requestOrigin = req.headers.origin;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const siteBaseUrl = process.env.SITE_BASE_URL || requestOrigin || vercelUrl || "https://isadora-pinheiro-art.vercel.app";
  const preference = {
    items,
    back_urls: {
      success: `${siteBaseUrl}/outputs/index.html#pedido-aprovado`,
      failure: `${siteBaseUrl}/outputs/index.html#pedido-recusado`,
      pending: `${siteBaseUrl}/outputs/index.html#pedido-pendente`,
    },
    auto_return: "approved",
    statement_descriptor: "ATELIER",
  };

  try {
    const mpResponse = await fetch(MERCADO_PAGO_PREFERENCES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      res.status(mpResponse.status).json({
        error: "Mercado Pago recusou a criacao da preferencia.",
        details: data,
      });
      return;
    }

    res.status(200).json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (error) {
    res.status(500).json({
      error: "Nao foi possivel conectar ao Mercado Pago.",
      details: error.message,
    });
  }
};
