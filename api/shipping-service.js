const { database, ensureStateTable } = require("./db");

const REGION_STATES = {
  north: new Set(["AC", "AP", "AM", "PA", "RO", "RR", "TO"]),
  northeast: new Set(["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"]),
  centerWest: new Set(["DF", "GO", "MT", "MS"]),
  southeast: new Set(["ES", "MG", "RJ", "SP"]),
  south: new Set(["PR", "RS", "SC"]),
};

const REGION_NAMES = {
  north: "Norte",
  northeast: "Nordeste",
  centerWest: "Centro-Oeste",
  southeast: "Sudeste",
  south: "Sul",
};

const defaultShippingSettings = {
  enabled: false,
  additionalItemFee: 0,
  freeShippingThreshold: 0,
  rates: {
    north: { price: 0, minDays: 1, maxDays: 1 },
    northeast: { price: 0, minDays: 1, maxDays: 1 },
    centerWest: { price: 0, minDays: 1, maxDays: 1 },
    southeast: { price: 0, minDays: 1, maxDays: 1 },
    south: { price: 0, minDays: 1, maxDays: 1 },
  },
};

function normalizeMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Number(number.toFixed(2))) : 0;
}

function normalizeDays(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.max(1, Math.min(number, 90)) : 1;
}

function normalizeShippingSettings(value = {}) {
  value = value && typeof value === "object" ? value : {};
  const rates = {};
  Object.keys(REGION_NAMES).forEach((region) => {
    const rate = value.rates?.[region] || {};
    const minDays = normalizeDays(rate.minDays);
    rates[region] = {
      price: normalizeMoney(rate.price),
      minDays,
      maxDays: Math.max(minDays, normalizeDays(rate.maxDays)),
    };
  });

  return {
    enabled: Boolean(value.enabled),
    additionalItemFee: normalizeMoney(value.additionalItemFee),
    freeShippingThreshold: normalizeMoney(value.freeShippingThreshold),
    rates,
  };
}

async function loadShippingSettings() {
  await ensureStateTable();
  const db = database();
  const rows = await db`
    select value
    from atelier_state
    where key = 'shipping-settings'
    limit 1
  `;
  return normalizeShippingSettings(rows[0]?.value || defaultShippingSettings);
}

function regionForState(state) {
  return Object.keys(REGION_STATES).find((region) => REGION_STATES[region].has(state)) || null;
}

async function lookupPostalCode(value) {
  const postalCode = String(value || "").replace(/\D/g, "");
  if (postalCode.length !== 8) {
    const error = new Error("Informe um CEP com 8 numeros.");
    error.statusCode = 400;
    throw error;
  }

  let response;
  try {
    response = await fetch(`https://viacep.com.br/ws/${postalCode}/json/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(7000),
    });
  } catch {
    const error = new Error("A consulta de CEP esta temporariamente indisponivel. Tente novamente.");
    error.statusCode = 503;
    throw error;
  }

  if (!response.ok) {
    const error = new Error("Nao foi possivel consultar esse CEP.");
    error.statusCode = 502;
    throw error;
  }

  const address = await response.json();
  if (address.erro || !address.uf) {
    const error = new Error("CEP nao encontrado.");
    error.statusCode = 400;
    throw error;
  }

  return {
    postalCode,
    street: String(address.logradouro || ""),
    neighborhood: String(address.bairro || ""),
    city: String(address.localidade || ""),
    state: String(address.uf || "").toUpperCase(),
  };
}

async function calculateShipping({ postalCode, itemCount, subtotal }) {
  const settings = await loadShippingSettings();
  if (!settings.enabled) return { configured: false, price: 0 };

  const destination = await lookupPostalCode(postalCode);
  const region = regionForState(destination.state);
  const rate = region ? settings.rates[region] : null;
  if (!rate) {
    const error = new Error("Ainda nao entregamos para esse CEP.");
    error.statusCode = 400;
    throw error;
  }

  const quantity = Math.max(1, Number.parseInt(itemCount, 10) || 1);
  const freeShipping = settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold;
  const price = freeShipping
    ? 0
    : normalizeMoney(rate.price + settings.additionalItemFee * Math.max(0, quantity - 1));

  return {
    configured: true,
    postalCode: destination.postalCode,
    destination,
    region,
    regionName: REGION_NAMES[region],
    price,
    minDays: rate.minDays,
    maxDays: rate.maxDays,
    freeShipping,
  };
}

module.exports = {
  REGION_NAMES,
  calculateShipping,
  defaultShippingSettings,
  loadShippingSettings,
  normalizeShippingSettings,
};
