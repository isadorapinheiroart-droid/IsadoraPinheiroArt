const MERCADO_PAGO_PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";
const crypto = require("crypto");
const { database, ensureOrdersTable, ensureStateTable } = require("./db");

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

function normalizeText(value, maxLength) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeDelivery(delivery) {
  const normalized = {
    fullName: normalizeText(delivery?.fullName, 120),
    address: normalizeText(delivery?.address, 240),
    number: normalizeText(delivery?.number, 30),
    postalCode: String(delivery?.postalCode || "").replace(/\D/g, "").slice(0, 8),
    referencePoint: normalizeText(delivery?.referencePoint, 160),
  };

  if (
    normalized.fullName.length < 3
    || normalized.address.length < 8
    || !normalized.number
    || normalized.postalCode.length !== 8
  ) {
    const error = new Error("Preencha corretamente os dados de entrega e informe um CEP com 8 numeros.");
    error.statusCode = 400;
    throw error;
  }
  return normalized;
}

function createOrderCode() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `IP-${date}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
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

    const unitPrice = Number(product?.price || 0);

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
  let delivery;
  try {
    delivery = normalizeDelivery(body.delivery);
  } catch (error) {
    res.status(error.statusCode || 400).json({ error: error.message });
    return;
  }
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
  const siteBaseUrl = (process.env.SITE_BASE_URL || requestOrigin || vercelUrl || "https://isadora-pinheiro-art.vercel.app").replace(/\/$/, "");
  const orderId = crypto.randomUUID();
  const orderCode = createOrderCode();
  const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const nameParts = delivery.fullName.split(" ");
  let db;

  try {
    db = database();
    await ensureOrdersTable();
    await db`
      insert into atelier_orders (
        id, order_code, status, customer_name, delivery_address,
        address_number, postal_code, reference_point, items, total
      ) values (
        ${orderId}, ${orderCode}, 'creating_payment', ${delivery.fullName}, ${delivery.address},
        ${delivery.number}, ${delivery.postalCode}, ${delivery.referencePoint || null},
        ${db.json(items)}, ${total.toFixed(2)}
      )
    `;
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: "Nao foi possivel registrar o pedido no banco de dados.",
      details: error.message,
    });
    return;
  }

  const payerName = nameParts.shift();
  const payerSurname = nameParts.join(" ");
  const preference = {
    items,
    payer: {
      name: payerName,
      ...(payerSurname ? { surname: payerSurname } : {}),
    },
    back_urls: {
      success: `${siteBaseUrl}/outputs/index.html#pedido-aprovado`,
      failure: `${siteBaseUrl}/outputs/index.html#pedido-recusado`,
      pending: `${siteBaseUrl}/outputs/index.html#pedido-pendente`,
    },
    notification_url: `${siteBaseUrl}/api/mercado-pago-webhook`,
    external_reference: orderId,
    metadata: {
      order_id: orderId,
      order_code: orderCode,
    },
    auto_return: "approved",
    statement_descriptor: "ISADORAART",
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
      await db`
        update atelier_orders
        set status = 'checkout_error', updated_at = now()
        where id = ${orderId}
      `;
      res.status(mpResponse.status).json({
        error: "Mercado Pago recusou a criacao da preferencia.",
        details: data,
      });
      return;
    }

    await db`
      update atelier_orders
      set status = 'pending_payment', mp_preference_id = ${String(data.id)}, updated_at = now()
      where id = ${orderId}
    `;

    res.status(200).json({
      id: data.id,
      order_id: orderId,
      order_code: orderCode,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (error) {
    try {
      await db`
        update atelier_orders
        set status = 'checkout_error', updated_at = now()
        where id = ${orderId}
      `;
    } catch {
      // O erro original do checkout e mais util para diagnostico.
    }
    res.status(500).json({
      error: "Nao foi possivel conectar ao Mercado Pago.",
      details: error.message,
    });
  }
};
