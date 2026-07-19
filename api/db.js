const postgres = require("postgres");

let sql;

function database() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    const error = new Error("DATABASE_URL nao configurado no servidor.");
    error.statusCode = 500;
    throw error;
  }

  if (!sql) {
    sql = postgres(connectionString, {
      max: 1,
      prepare: false,
      ssl: "require",
    });
  }

  return sql;
}

async function ensureStateTable() {
  const db = database();
  await db`
    create table if not exists atelier_state (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )
  `;
}

async function ensureOrdersTable() {
  const db = database();
  await db`
    create table if not exists atelier_orders (
      id text primary key,
      order_code text unique not null,
      status text not null default 'pending_payment',
      customer_name text not null,
      delivery_address text not null,
      address_number text not null,
      postal_code text not null,
      reference_point text,
      items jsonb not null,
      shipping_price numeric(12, 2) not null default 0,
      shipping_region text,
      shipping_min_days integer,
      shipping_max_days integer,
      total numeric(12, 2) not null,
      mp_preference_id text,
      mp_payment_id text,
      mp_status text,
      mp_status_detail text,
      payer_email text,
      stock_applied boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      paid_at timestamptz
    )
  `;
  await db`alter table atelier_orders add column if not exists shipping_price numeric(12, 2) not null default 0`;
  await db`alter table atelier_orders add column if not exists shipping_region text`;
  await db`alter table atelier_orders add column if not exists shipping_min_days integer`;
  await db`alter table atelier_orders add column if not exists shipping_max_days integer`;
  await db`create index if not exists atelier_orders_created_at_idx on atelier_orders (created_at desc)`;
  await db`create index if not exists atelier_orders_payment_id_idx on atelier_orders (mp_payment_id)`;
}

module.exports = {
  database,
  ensureOrdersTable,
  ensureStateTable,
};
