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

module.exports = {
  database,
  ensureStateTable,
};
