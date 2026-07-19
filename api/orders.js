const { requireAdmin } = require("./auth");
const { database, ensureOrdersTable } = require("./db");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }
  if (!requireAdmin(req, res)) return;

  try {
    await ensureOrdersTable();
    const db = database();
    const orders = await db`
      select
        id, order_code, status, customer_name, delivery_address,
        address_number, postal_code, reference_point, items, total,
        shipping_price, shipping_region, shipping_min_days, shipping_max_days,
        mp_preference_id, mp_payment_id, mp_status, mp_status_detail,
        payer_email, created_at, updated_at, paid_at
      from atelier_orders
      order by created_at desc
      limit 200
    `;
    res.status(200).json({ orders });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || "Erro ao carregar pedidos." });
  }
};
