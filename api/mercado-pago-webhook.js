const { database, ensureOrdersTable, ensureStateTable } = require("./db");

const MERCADO_PAGO_PAYMENTS_URL = "https://api.mercadopago.com/v1/payments";

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

function paymentIdFromRequest(req) {
  const body = getBody(req);
  const url = new URL(req.url, "https://isadora-pinheiro-art.vercel.app");
  const type = body.type || body.topic || url.searchParams.get("type") || url.searchParams.get("topic");
  if (type && type !== "payment") return null;
  const paymentId = body.data?.id || body.id || url.searchParams.get("data.id") || url.searchParams.get("id");
  return /^\d{1,32}$/.test(String(paymentId || "")) ? String(paymentId) : null;
}

function orderStatus(paymentStatus) {
  const statuses = new Set([
    "approved",
    "pending",
    "in_process",
    "rejected",
    "cancelled",
    "refunded",
    "charged_back",
  ]);
  return statuses.has(paymentStatus) ? paymentStatus : "payment_review";
}

async function updateOrderFromPayment(payment) {
  const orderId = String(payment.external_reference || payment.metadata?.order_id || "");
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return false;

  const db = database();
  let found = false;
  await db.begin(async (transaction) => {
    const rows = await transaction`
      select id, total, items, stock_applied
      from atelier_orders
      where id = ${orderId}
      for update
    `;
    const order = rows[0];
    if (!order) return;
    found = true;

    const receivedTotal = Number(payment.transaction_amount);
    const expectedTotal = Number(order.total);
    const amountMatches = Number.isFinite(receivedTotal) && Math.abs(receivedTotal - expectedTotal) < 0.01;
    const nextStatus = amountMatches ? orderStatus(payment.status) : "payment_review";
    const approvedAt = nextStatus === "approved" ? payment.date_approved || new Date().toISOString() : null;

    await transaction`
      update atelier_orders
      set
        status = ${nextStatus},
        mp_payment_id = ${String(payment.id)},
        mp_status = ${String(payment.status || "")},
        mp_status_detail = ${String(payment.status_detail || "")},
        payer_email = ${payment.payer?.email || null},
        paid_at = coalesce(${approvedAt}::timestamptz, paid_at),
        updated_at = now()
      where id = ${orderId}
    `;

    if (nextStatus !== "approved" || order.stock_applied) return;

    const productRows = await transaction`
      select value
      from atelier_state
      where key = 'products'
      for update
    `;
    if (Array.isArray(productRows[0]?.value)) {
      const quantities = new Map(order.items.map((item) => [String(item.id), Number(item.quantity) || 1]));
      const products = productRows[0].value.map((product) => {
        const quantity = quantities.get(String(product.id));
        if (!quantity) return product;
        return { ...product, stock: Math.max(0, Number(product.stock || 0) - quantity) };
      });
      await transaction`
        update atelier_state
        set value = ${transaction.json(products)}, updated_at = now()
        where key = 'products'
      `;
    }
    await transaction`
      update atelier_orders
      set stock_applied = true, updated_at = now()
      where id = ${orderId}
    `;
  });
  return found;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  const paymentId = paymentIdFromRequest(req);
  if (!paymentId) {
    res.status(200).json({ ok: true, ignored: true });
    return;
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: "MP_ACCESS_TOKEN nao configurado." });
    return;
  }

  try {
    await ensureOrdersTable();
    await ensureStateTable();
    const response = await fetch(`${MERCADO_PAGO_PAYMENTS_URL}/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.status === 404) {
      res.status(200).json({ ok: true, ignored: "payment_not_found" });
      return;
    }
    if (!response.ok) throw new Error(`Mercado Pago respondeu com status ${response.status}.`);

    const payment = await response.json();
    const updated = await updateOrderFromPayment(payment);
    res.status(200).json({ ok: true, updated });
  } catch (error) {
    res.status(500).json({ error: error.message || "Erro ao processar notificacao." });
  }
};
