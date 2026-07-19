const storageKey = "atelier-products-v1";
const cartKey = "atelier-cart-v1";
const adminSessionKey = "atelier-admin-session";
const checkoutEndpointKey = "atelier-checkout-endpoint";
const heroSettingsKey = "atelier-hero-settings-v1";
const siteSettingsKey = "atelier-site-settings-v1";
const adminPassword = "atelier2026";
const publicConfig = window.ATELIER_CONFIG || {};
const stateEndpoint = publicConfig.stateEndpoint || "/api/state";
const shippingEndpoint = publicConfig.shippingEndpoint || "/api/shipping";
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const els = {
  artGrid: document.querySelector("#artGrid"),
  resultCount: document.querySelector("#resultCount"),
  clearFilters: document.querySelector("#clearFilters"),
  collectionFilter: document.querySelector("#collectionFilter"),
  materialFilter: document.querySelector("#materialFilter"),
  paintFilter: document.querySelector("#paintFilter"),
  colorFilter: document.querySelector("#colorFilter"),
  sizeFilter: document.querySelector("#sizeFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  form: document.querySelector("#productForm"),
  inventory: document.querySelector("#inventoryList"),
  modal: document.querySelector("#productModal"),
  modalBody: document.querySelector("#modalBody"),
  closeModal: document.querySelector("#closeModal"),
  resetDemo: document.querySelector("#resetDemo"),
  newProduct: document.querySelector("#newProduct"),
  imageSequence: document.querySelector("#imageSequence"),
  admin: document.querySelector("#admin"),
  adminEntry: document.querySelector("#adminEntry"),
  loginModal: document.querySelector("#loginModal"),
  loginForm: document.querySelector("#loginForm"),
  closeLogin: document.querySelector("#closeLogin"),
  adminPassword: document.querySelector("#adminPassword"),
  loginError: document.querySelector("#loginError"),
  logoutAdmin: document.querySelector("#logoutAdmin"),
  cartTrigger: document.querySelector("#cartTrigger"),
  cartCount: document.querySelector("#cartCount"),
  cartDrawer: document.querySelector("#cartDrawer"),
  closeCart: document.querySelector("#closeCart"),
  cartItems: document.querySelector("#cartItems"),
  cartSubtotal: document.querySelector("#cartSubtotal"),
  cartTotal: document.querySelector("#cartTotal"),
  shippingTotalRow: document.querySelector("#shippingTotalRow"),
  shippingTotal: document.querySelector("#shippingTotal"),
  checkoutButton: document.querySelector("#checkoutButton"),
  checkoutNote: document.querySelector("#checkoutNote"),
  deliveryForm: document.querySelector("#deliveryForm"),
  deliveryFullName: document.querySelector("#deliveryFullName"),
  deliveryAddress: document.querySelector("#deliveryAddress"),
  deliveryNumber: document.querySelector("#deliveryNumber"),
  deliveryPostalCode: document.querySelector("#deliveryPostalCode"),
  deliveryReferencePoint: document.querySelector("#deliveryReferencePoint"),
  calculateShipping: document.querySelector("#calculateShipping"),
  shippingResult: document.querySelector("#shippingResult"),
  checkoutEndpointInput: document.querySelector("#checkoutEndpointInput"),
  saveCheckoutEndpoint: document.querySelector("#saveCheckoutEndpoint"),
  navHomeLink: document.querySelector("#navHomeLink"),
  navAboutLink: document.querySelector("#navAboutLink"),
  navWorksLink: document.querySelector("#navWorksLink"),
  brandMark: document.querySelector("#brandMark"),
  servicesSubtitle: document.querySelector("#servicesSubtitle"),
  servicesTitle: document.querySelector("#servicesTitle"),
  servicesText: document.querySelector("#servicesText"),
  processSubtitle: document.querySelector("#processSubtitle"),
  processTitle: document.querySelector("#processTitle"),
  processText: document.querySelector("#processText"),
  contactSubtitle: document.querySelector("#contactSubtitle"),
  contactTitle: document.querySelector("#contactTitle"),
  contactText: document.querySelector("#contactText"),
};

const fields = {
  id: document.querySelector("#productId"),
  title: document.querySelector("#titleInput"),
  collection: document.querySelector("#collectionInput"),
  color: document.querySelector("#colorInput"),
  material: document.querySelector("#materialInput"),
  paint: document.querySelector("#paintInput"),
  height: document.querySelector("#heightInput"),
  width: document.querySelector("#widthInput"),
  depth: document.querySelector("#depthInput"),
  stock: document.querySelector("#stockInput"),
  price: document.querySelector("#priceInput"),
  description: document.querySelector("#descriptionInput"),
  images: document.querySelector("#imageInput"),
  similar: document.querySelector("#similarInput"),
};

let products = loadProducts();
let cart = loadCart();
let shippingQuote = null;

const defaultSiteSettings = {
  nav: {
    home: "Início",
    about: "Sobre",
    works: "Obras",
    cart: "Carrinho",
    brand: "IP",
    x: 0,
    y: 0,
    scale: 100,
  },
  sections: {
    services: {
      subtitle: "Serviços",
      title: "Originais, prints e encomendas",
      text: "Escolha uma obra disponível ou use o contato para conversar sobre peças autorais para o seu espaço.",
    },
    process: {
      subtitle: "Processo",
      title: "Da pintura ao envio",
      text: "Cada obra é conferida, embalada com cuidado e preparada para chegar com segurança ao seu novo espaço.",
    },
    contact: {
      subtitle: "Contato",
      title: "Encomendas e dúvidas",
      text: "Use o carrinho para escolher suas obras favoritas e finalizar o pedido quando o checkout estiver configurado.",
    },
  },
  works: {
    scale: 100,
  },
};

function loadHeroSettings() {
  const saved = localStorage.getItem(heroSettingsKey);
  return saved ? JSON.parse(saved) : null;
}

function applyHeroSettings() {
  const settings = loadHeroSettings();
  const root = document.documentElement;
  if (!settings) {
    root.style.removeProperty("--hero-image");
    root.style.removeProperty("--hero-pos-x");
    root.style.removeProperty("--hero-pos-y");
    root.style.removeProperty("--hero-size");
    return;
  }
  if (settings.image) root.style.setProperty("--hero-image", `url("${settings.image}")`);
  root.style.setProperty("--hero-pos-x", `${settings.x ?? 50}%`);
  root.style.setProperty("--hero-pos-y", `${settings.y ?? 0}%`);
  root.style.setProperty("--hero-size", `${settings.scale ?? 100}% auto`);
}

function mergeSiteSettings(saved = {}) {
  return {
    nav: { ...defaultSiteSettings.nav, ...(saved.nav || {}) },
    sections: {
      services: { ...defaultSiteSettings.sections.services, ...(saved.sections?.services || {}) },
      process: { ...defaultSiteSettings.sections.process, ...(saved.sections?.process || {}) },
      contact: { ...defaultSiteSettings.sections.contact, ...(saved.sections?.contact || {}) },
    },
    works: { ...defaultSiteSettings.works, ...(saved.works || {}) },
  };
}

function loadSiteSettings() {
  const saved = localStorage.getItem(siteSettingsKey);
  return mergeSiteSettings(saved ? JSON.parse(saved) : {});
}

function setCartButtonText(text) {
  const count = els.cartCount.textContent || "0";
  els.cartTrigger.textContent = `${text || defaultSiteSettings.nav.cart} `;
  els.cartTrigger.appendChild(els.cartCount);
  els.cartCount.textContent = count;
}

function applySiteSettings() {
  const settings = loadSiteSettings();
  const root = document.documentElement;
  els.navHomeLink.textContent = settings.nav.home;
  els.navAboutLink.textContent = settings.nav.about;
  els.navWorksLink.textContent = settings.nav.works;
  els.brandMark.textContent = settings.nav.brand;
  setCartButtonText(settings.nav.cart);
  root.style.setProperty("--nav-offset-x", `${settings.nav.x}px`);
  root.style.setProperty("--nav-offset-y", `${settings.nav.y}px`);
  root.style.setProperty("--nav-scale", String((Number(settings.nav.scale) || 100) / 100));
  root.style.setProperty("--works-scale", String((Number(settings.works.scale) || 100) / 100));

  els.servicesSubtitle.textContent = settings.sections.services.subtitle;
  els.servicesTitle.textContent = settings.sections.services.title;
  els.servicesText.textContent = settings.sections.services.text;
  els.processSubtitle.textContent = settings.sections.process.subtitle;
  els.processTitle.textContent = settings.sections.process.title;
  els.processText.textContent = settings.sections.process.text;
  els.contactSubtitle.textContent = settings.sections.contact.subtitle;
  els.contactTitle.textContent = settings.sections.contact.title;
  els.contactText.textContent = settings.sections.contact.text;
}

function artSvg(title, bg, accent, second) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1120">
    <rect width="900" height="1120" fill="${bg}"/>
    <rect x="86" y="76" width="728" height="968" rx="22" fill="#fffdf8" stroke="#222831" stroke-width="18"/>
    <circle cx="645" cy="230" r="112" fill="${second}" opacity=".92"/>
    <path d="M130 842 C258 590 318 720 424 405 C536 598 626 392 760 710 L760 990 L130 990Z" fill="${accent}" opacity=".95"/>
    <path d="M142 470 C262 338 360 618 514 438 C606 330 662 372 762 290" fill="none" stroke="${second}" stroke-width="42" stroke-linecap="round"/>
    <path d="M170 198 C302 122 430 190 502 116 C540 238 422 318 292 284 C220 266 182 232 170 198Z" fill="${accent}" opacity=".75"/>
    <text x="450" y="1065" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#222831">${title}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function demoProducts() {
  const items = [
    {
      id: crypto.randomUUID(),
      title: "Jardim Interno",
      collection: "Natureza Viva",
      material: "Quadro",
      paint: "PVA",
      color: "verde",
      height: 80,
      width: 60,
      depth: 3,
      stock: 2,
      price: 780,
      description: "Pintura autoral com camadas orgânicas, pensada para ambientes de leitura, salas e escritórios com luz natural.",
      images: [
        artSvg("Jardim Interno", "#dfe7e2", "#1f7a6b", "#f1b84b"),
        artSvg("Detalhe", "#eef2ec", "#2f6f9f", "#b64b35"),
        artSvg("Ambiente", "#e5ded2", "#1f7a6b", "#304b63"),
      ],
      similarIds: [],
    },
    {
      id: crypto.randomUUID(),
      title: "Ritmo Terracota",
      collection: "Abstratos",
      material: "MDF",
      paint: "Tinta de tecido",
      color: "terracota",
      height: 50,
      width: 50,
      depth: 2,
      stock: 0,
      price: 420,
      description: "Composição geométrica em tons quentes. O acabamento em MDF cria presença mesmo em paredes compactas.",
      images: [
        artSvg("Ritmo Terracota", "#eadfd4", "#b64b35", "#1f7a6b"),
        artSvg("Detalhe", "#f3e7d9", "#b64b35", "#f1b84b"),
      ],
      similarIds: [],
    },
    {
      id: crypto.randomUUID(),
      title: "Azul de Janela",
      collection: "Paisagens Imaginadas",
      material: "Print",
      paint: "Impressão Fine Art",
      color: "azul",
      height: 70,
      width: 100,
      depth: 1,
      stock: 5,
      price: 260,
      description: "Print numerado de pintura original, com atmosfera calma e boa leitura à distância.",
      images: [
        artSvg("Azul de Janela", "#d9e7f0", "#2f6f9f", "#f1b84b"),
        artSvg("Detalhe", "#edf5f7", "#304b63", "#b64b35"),
      ],
      similarIds: [],
    },
  ];
  items[0].similarIds = [items[2].id, items[1].id];
  items[1].similarIds = [items[0].id];
  items[2].similarIds = [items[0].id];
  return items;
}

function loadProducts() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : demoProducts();
}

function saveProducts() {
  localStorage.setItem(storageKey, JSON.stringify(products));
  savePersistentValue("products", products);
}

async function loadPersistentValue(key) {
  try {
    const response = await fetch(`${stateEndpoint}?key=${encodeURIComponent(key)}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Estado remoto indisponivel.");
    const data = await response.json();
    return data.value;
  } catch (error) {
    return null;
  }
}

async function savePersistentValue(key, value) {
  try {
    await fetch(`${stateEndpoint}?key=${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
  } catch (error) {
    // O navegador continua usando localStorage se o banco ainda nao estiver configurado.
  }
}

async function syncProductsFromDatabase() {
  const remoteProducts = await loadPersistentValue("products");
  if (!Array.isArray(remoteProducts)) return;
  products = remoteProducts;
  localStorage.setItem(storageKey, JSON.stringify(products));
  renderAll();
  renderCart();
}

async function syncSettingsFromDatabase() {
  const [heroSettings, siteSettings] = await Promise.all([
    loadPersistentValue("hero-settings"),
    loadPersistentValue("site-settings"),
  ]);

  if (heroSettings) {
    localStorage.setItem(heroSettingsKey, JSON.stringify(heroSettings));
    applyHeroSettings();
  }

  if (siteSettings) {
    localStorage.setItem(siteSettingsKey, JSON.stringify(siteSettings));
    applySiteSettings();
  }
}

function loadCart() {
  const saved = localStorage.getItem(cartKey);
  return saved ? JSON.parse(saved) : [];
}

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function unique(key) {
  return [...new Set(products.map((item) => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function setOptions(select, values, allLabel = "Todos") {
  select.innerHTML = `<option value="">${allLabel}</option>` + values.map((value) => `<option value="${value}">${value}</option>`).join("");
}

function fillDatalist(id, values) {
  document.querySelector(id).innerHTML = values.map((value) => `<option value="${value}"></option>`).join("");
}

function sizeOf(product) {
  const area = Number(product.height) * Number(product.width);
  if (area < 2500) return "pequeno";
  if (area < 6000) return "medio";
  return "grande";
}

function currentFilters() {
  return {
    collection: els.collectionFilter.value,
    material: els.materialFilter.value,
    paint: els.paintFilter.value,
    color: els.colorFilter.value,
    size: els.sizeFilter.value,
    sort: els.sortFilter.value,
  };
}

function filteredProducts() {
  const filters = currentFilters();
  const list = products.filter((product) => {
    return (!filters.collection || product.collection === filters.collection)
      && (!filters.material || product.material === filters.material)
      && (!filters.paint || product.paint === filters.paint)
      && (!filters.color || product.color === filters.color)
      && (!filters.size || sizeOf(product) === filters.size);
  });

  if (filters.sort === "priceAsc") list.sort((a, b) => Number(a.price) - Number(b.price));
  if (filters.sort === "priceDesc") list.sort((a, b) => Number(b.price) - Number(a.price));
  if (filters.sort === "stock") list.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
  return list;
}

function renderFilters() {
  setOptions(els.collectionFilter, unique("collection"));
  setOptions(els.materialFilter, unique("material"));
  setOptions(els.paintFilter, unique("paint"));
  setOptions(els.colorFilter, unique("color"));
  fillDatalist("#collectionList", unique("collection"));
  fillDatalist("#materialList", unique("material"));
  fillDatalist("#paintList", unique("paint"));
}

function productCard(product) {
  const price = Number(product.stock) === 0 ? `<p class="price soldout">ESGOTADO</p>` : `<p class="price">${money.format(product.price)}</p>`;
  return `
    <article class="art-card" data-id="${product.id}" tabindex="0" role="button" aria-label="Abrir ${product.title}">
      <img src="${product.images[0]}" alt="${product.title}">
      <div class="art-info">
        <h3>${product.title}</h3>
        <p class="meta">${product.collection} · ${product.material} · ${product.height} x ${product.width} x ${product.depth} cm</p>
        ${price}
        <div class="tags">
          <span class="tag">${product.paint}</span>
          <span class="tag">${product.color}</span>
        </div>
      </div>
    </article>`;
}

function renderGallery() {
  const list = filteredProducts();
  els.resultCount.textContent = `${list.length} obra${list.length === 1 ? "" : "s"}`;
  els.artGrid.innerHTML = list.map(productCard).join("") || `<p>Nenhuma obra encontrada para estes filtros.</p>`;
  document.querySelectorAll(".art-card").forEach((card) => {
    card.addEventListener("click", () => openProduct(card.dataset.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openProduct(card.dataset.id);
    });
  });
}

function renderInventory() {
  els.inventory.innerHTML = products.map((product) => `
    <div class="stock-row">
      <div>
        <p>${product.title}</p>
        <span class="meta">${product.stock} un. · ${product.material} · ${money.format(product.price)}</span>
      </div>
      <div class="stock-actions">
        <button type="button" data-edit="${product.id}">Editar</button>
        <button type="button" data-delete="${product.id}">Excluir</button>
      </div>
    </div>
  `).join("");

  els.inventory.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => editProduct(button.dataset.edit));
  });
  els.inventory.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      products = products.filter((product) => product.id !== button.dataset.delete);
      products.forEach((product) => product.similarIds = product.similarIds.filter((id) => id !== button.dataset.delete));
      saveProducts();
      renderAll();
    });
  });
}

function renderSimilarSelect(selectedId = "", selected = []) {
  fields.similar.innerHTML = products
    .filter((product) => product.id !== selectedId)
    .map((product) => `<option value="${product.id}" ${selected.includes(product.id) ? "selected" : ""}>${product.title}</option>`)
    .join("");
}

function renderImageSequence(images = []) {
  const labels = ["Foto principal", "Foto 2", "Foto 3"];
  const descriptions = [
    "Primeira imagem exibida na galeria e no topo do produto.",
    "Segunda imagem exibida no pop-up do produto.",
    "Terceira imagem exibida no pop-up do produto.",
  ];

  els.imageSequence.innerHTML = labels.map((label, index) => {
    const image = images[index];
    return `
      <article class="sequence-card ${image ? "" : "empty"}">
        <div class="sequence-image">
          ${image ? `<img src="${image}" alt="${label}">` : `<span>Sem foto</span>`}
        </div>
        <div>
          <strong>${label}</strong>
          <p>${descriptions[index]}</p>
        </div>
      </article>`;
  }).join("");
}

function isAdminLoggedIn() {
  return localStorage.getItem(adminSessionKey) === "active";
}

function setAdminVisible(visible) {
  els.admin.hidden = !visible;
  if (visible) {
    els.admin.classList.remove("admin-locked");
    els.checkoutEndpointInput.value = localStorage.getItem(checkoutEndpointKey) || "";
  } else {
    els.admin.classList.add("admin-locked");
  }
}

function openAdminLogin() {
  els.loginError.textContent = "";
  els.adminPassword.value = "";
  els.loginModal.showModal();
  els.adminPassword.focus();
}

function cartProducts() {
  return cart.map((id) => products.find((product) => product.id === id)).filter(Boolean);
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product || Number(product.stock) === 0) return;
  if (!cart.includes(id)) cart.push(id);
  resetShippingQuote();
  saveCart();
  renderCart();
  els.cartDrawer.showModal();
}

function removeFromCart(id) {
  cart = cart.filter((itemId) => itemId !== id);
  resetShippingQuote();
  saveCart();
  renderCart();
}

function shippingSignature(items = cartProducts()) {
  return items.map((product) => String(product.id)).sort().join("|");
}

function shippingQuoteMatches(items = cartProducts()) {
  const postalCode = els.deliveryPostalCode.value.replace(/\D/g, "");
  return Boolean(
    shippingQuote
    && shippingQuote.postalCode === postalCode
    && shippingQuote.signature === shippingSignature(items),
  );
}

function resetShippingQuote() {
  shippingQuote = null;
  if (els.shippingTotalRow) els.shippingTotalRow.hidden = true;
  if (els.shippingResult) {
    els.shippingResult.textContent = "";
    els.shippingResult.className = "";
  }
}

function renderCart() {
  const items = cartProducts();
  els.cartCount.textContent = items.length;
  els.cartItems.innerHTML = items.length ? items.map((product) => `
    <div class="cart-item">
      <img src="${product.images[0]}" alt="${product.title}">
      <div>
        <strong>${product.title}</strong>
        <p class="meta">${product.height} x ${product.width} cm · ${product.material}</p>
        <p>${money.format(product.price)}</p>
      </div>
      <button type="button" data-remove-cart="${product.id}">Remover</button>
    </div>
  `).join("") : `<p class="meta">Seu carrinho está vazio.</p>`;
  const subtotal = items.reduce((sum, product) => sum + Number(product.price), 0);
  if (shippingQuote && !shippingQuoteMatches(items)) resetShippingQuote();
  const shippingPrice = shippingQuoteMatches(items) ? Number(shippingQuote.price || 0) : 0;
  els.cartSubtotal.textContent = money.format(subtotal);
  els.shippingTotalRow.hidden = !shippingQuoteMatches(items);
  els.shippingTotal.textContent = shippingPrice === 0 ? "Grátis" : money.format(shippingPrice);
  els.cartTotal.textContent = money.format(subtotal + shippingPrice);
  els.checkoutButton.disabled = items.length === 0;
  els.checkoutNote.textContent = "";
  els.cartItems.querySelectorAll("[data-remove-cart]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.removeCart));
  });
}

async function calculateCartShipping() {
  const items = cartProducts();
  const postalCode = els.deliveryPostalCode.value.replace(/\D/g, "");
  if (!items.length) {
    els.shippingResult.textContent = "Adicione uma obra ao carrinho primeiro.";
    els.shippingResult.className = "error";
    return null;
  }
  if (postalCode.length !== 8) {
    els.shippingResult.textContent = "Informe um CEP com 8 números.";
    els.shippingResult.className = "error";
    return null;
  }

  els.calculateShipping.disabled = true;
  els.shippingResult.textContent = "Consultando o CEP...";
  els.shippingResult.className = "";
  try {
    const response = await fetch(shippingEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postalCode,
        items: items.map((product) => ({ id: product.id, quantity: 1 })),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Não foi possível calcular o frete.");
    if (!data.configured) {
      resetShippingQuote();
      els.shippingResult.textContent = "A tabela de frete ainda não foi ativada pela artista.";
      return data;
    }

    shippingQuote = {
      ...data,
      postalCode,
      signature: shippingSignature(items),
    };
    const days = data.minDays === data.maxDays
      ? `${data.minDays} dias úteis`
      : `${data.minDays} a ${data.maxDays} dias úteis`;
    const price = Number(data.price) === 0 ? "frete grátis" : money.format(Number(data.price));
    els.shippingResult.textContent = `${data.destination.city}/${data.destination.state}: ${price}, prazo estimado de ${days}.`;
    els.shippingResult.className = "success";

    if (!els.deliveryAddress.value.trim()) {
      els.deliveryAddress.value = [
        data.destination.street,
        data.destination.neighborhood,
        `${data.destination.city} - ${data.destination.state}`,
      ].filter(Boolean).join(", ");
    }
    renderCart();
    return data;
  } catch (error) {
    resetShippingQuote();
    els.shippingResult.textContent = error.message;
    els.shippingResult.className = "error";
    renderCart();
    return null;
  } finally {
    els.calculateShipping.disabled = false;
  }
}

function checkoutEndpoint() {
  return localStorage.getItem(checkoutEndpointKey) || publicConfig.checkoutEndpoint || "";
}

async function startCheckout() {
  const items = cartProducts();
  if (!items.length) return;
  if (!shippingQuoteMatches(items)) {
    const quote = await calculateCartShipping();
    if (!quote) return;
    if (quote.configured) {
      els.checkoutNote.textContent = "Frete calculado. Confira o total e clique novamente para ir ao pagamento.";
      return;
    }
  }
  const endpoint = checkoutEndpoint();
  if (!endpoint) {
    els.checkoutNote.textContent = "Checkout Mercado Pago preparado. Falta configurar um endpoint seguro no painel reservado para criar a preferência de pagamento.";
    return;
  }

  els.checkoutButton.disabled = true;
  els.checkoutNote.textContent = "Criando pagamento seguro...";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingPrice: shippingQuoteMatches(items) ? Number(shippingQuote.price || 0) : null,
        delivery: {
          fullName: els.deliveryFullName.value.trim(),
          address: els.deliveryAddress.value.trim(),
          number: els.deliveryNumber.value.trim(),
          postalCode: els.deliveryPostalCode.value.replace(/\D/g, ""),
          referencePoint: els.deliveryReferencePoint.value.trim(),
        },
        items: items.map((product) => ({
          id: product.id,
          title: product.title,
          quantity: 1,
          unit_price: Number(product.price),
          currency_id: "BRL",
        })),
      }),
    });
    const data = await response.json();
    const checkoutUrl = data.init_point || data.sandbox_init_point || data.url;
    if (!response.ok) {
      if (response.status === 409) {
        resetShippingQuote();
        renderCart();
      }
      throw new Error(data.error || "Resposta de checkout inválida.");
    }
    if (!checkoutUrl) throw new Error("Resposta de checkout inválida.");
    sessionStorage.setItem("atelier-pending-order", JSON.stringify({
      id: data.order_id,
      code: data.order_code,
    }));
    window.location.href = checkoutUrl;
  } catch (error) {
    els.checkoutNote.textContent = error.message || "Não foi possível iniciar o pagamento. Tente novamente.";
  } finally {
    els.checkoutButton.disabled = false;
  }
}

function renderAll() {
  renderFilters();
  renderGallery();
  renderInventory();
  renderSimilarSelect(fields.id.value, [...fields.similar.selectedOptions].map((option) => option.value));
}

function editProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  fields.id.value = product.id;
  fields.title.value = product.title;
  fields.collection.value = product.collection;
  fields.color.value = product.color;
  fields.material.value = product.material;
  fields.paint.value = product.paint;
  fields.height.value = product.height;
  fields.width.value = product.width;
  fields.depth.value = product.depth;
  fields.stock.value = product.stock;
  fields.price.value = product.price;
  fields.description.value = product.description;
  fields.images.value = "";
  renderImageSequence(product.images || []);
  renderSimilarSelect(product.id, product.similarIds || []);
  fields.title.focus();
}

function clearForm() {
  els.form.reset();
  fields.id.value = "";
  renderImageSequence();
  renderSimilarSelect();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function saveForm(event) {
  event.preventDefault();
  const id = fields.id.value || crypto.randomUUID();
  const existing = products.find((product) => product.id === id);
  const selectedImages = [...fields.images.files].slice(0, 3);
  const uploaded = await Promise.all(selectedImages.map(fileToDataUrl));
  const product = {
    id,
    title: fields.title.value.trim(),
    collection: fields.collection.value.trim(),
    color: fields.color.value.trim().toLowerCase(),
    material: fields.material.value.trim(),
    paint: fields.paint.value.trim(),
    height: Number(fields.height.value),
    width: Number(fields.width.value),
    depth: Number(fields.depth.value),
    stock: Number(fields.stock.value),
    price: Number(fields.price.value),
    description: fields.description.value.trim(),
    images: uploaded.length ? uploaded : existing?.images || [artSvg(fields.title.value.trim(), "#edf4f2", "#1f7a6b", "#f1b84b")],
    similarIds: [...fields.similar.selectedOptions].map((option) => option.value),
  };

  products = existing ? products.map((item) => item.id === id ? product : item) : [...products, product];
  saveProducts();
  clearForm();
  renderAll();
}

function openProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const price = Number(product.stock) === 0 ? `<p class="price soldout">ESGOTADO</p>` : `<p class="price">${money.format(product.price)}</p>`;
  const similar = (product.similarIds || []).map((sid) => products.find((item) => item.id === sid)).filter(Boolean);
  els.modalBody.innerHTML = `
    <div class="photo-viewer">
      <div class="main-photo-wrap">
        <img id="mainModalImage" src="${product.images[0]}" alt="${product.title}">
        ${Number(product.stock) > 0 ? `<button class="buy-float" id="buyFromPhoto" type="button">Comprar</button>` : ""}
      </div>
      <div class="thumbs">
        ${product.images.slice(0, 3).map((image, index) => `<button type="button" data-image="${index}"><img src="${image}" alt="Foto ${index + 1} de ${product.title}"></button>`).join("")}
      </div>
    </div>
    <div class="details">
      <p class="eyebrow">${product.collection}</p>
      <h2>${product.title}</h2>
      <p class="meta">${product.material} · ${product.paint} · cor ${product.color}</p>
      ${price}
      ${Number(product.stock) > 0 ? `<div class="buy-actions"><button class="primary-button detail-buy" type="button" data-add-cart="${product.id}">Adicionar ao carrinho</button><button class="checkout-now" type="button" data-buy-now="${product.id}">Comprar agora</button></div>` : ""}
      <p><strong>Dimensões:</strong> ${product.height} cm altura, ${product.width} cm largura, ${product.depth} cm espessura.</p>
      <p>${product.description}</p>
      <h3>Quadros similares</h3>
      <div class="similar-grid">
        ${similar.length ? similar.map((item) => `
          <button class="similar" type="button" data-open-similar="${item.id}">
            <img src="${item.images[0]}" alt="${item.title}">
            <p>${item.title}</p>
          </button>
        `).join("") : `<p class="meta">Nenhum similar indicado pelo administrador.</p>`}
      </div>
    </div>`;

  els.modalBody.querySelectorAll("[data-image]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#mainModalImage").src = product.images[Number(button.dataset.image)];
      const buyButton = document.querySelector("#buyFromPhoto");
      if (buyButton) buyButton.hidden = Number(button.dataset.image) !== 0;
    });
  });
  const mainImage = document.querySelector("#mainModalImage");
  const buyButton = document.querySelector("#buyFromPhoto");
  if (mainImage && buyButton) {
    mainImage.addEventListener("click", () => {
      buyButton.hidden = false;
    });
    buyButton.addEventListener("click", () => addToCart(product.id));
  }
  els.modalBody.querySelectorAll("[data-add-cart]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.addCart));
  });
  els.modalBody.querySelectorAll("[data-buy-now]").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.buyNow);
    });
  });
  els.modalBody.querySelectorAll("[data-open-similar]").forEach((button) => {
    button.addEventListener("click", () => openProduct(button.dataset.openSimilar));
  });
  els.modal.showModal();
}

["change", "input"].forEach((eventName) => {
  [els.collectionFilter, els.materialFilter, els.paintFilter, els.colorFilter, els.sizeFilter, els.sortFilter]
    .forEach((filter) => filter.addEventListener(eventName, renderGallery));
});

els.clearFilters.addEventListener("click", () => {
  [els.collectionFilter, els.materialFilter, els.paintFilter, els.colorFilter, els.sizeFilter].forEach((filter) => filter.value = "");
  els.sortFilter.value = "featured";
  renderGallery();
});
els.form.addEventListener("submit", saveForm);
els.newProduct.addEventListener("click", clearForm);
els.closeModal.addEventListener("click", () => els.modal.close());
els.adminEntry.addEventListener("click", openAdminLogin);
els.closeLogin.addEventListener("click", () => els.loginModal.close());
els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (els.adminPassword.value === adminPassword) {
    localStorage.setItem(adminSessionKey, "active");
    setAdminVisible(true);
    els.loginModal.close();
    location.hash = "#admin";
  } else {
    els.loginError.textContent = "Senha incorreta.";
  }
});
els.logoutAdmin.addEventListener("click", () => {
  localStorage.removeItem(adminSessionKey);
  setAdminVisible(false);
  location.hash = "#galeria";
});
els.cartTrigger.addEventListener("click", () => {
  renderCart();
  els.cartDrawer.showModal();
});
els.closeCart.addEventListener("click", () => els.cartDrawer.close());
els.deliveryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startCheckout();
});
els.calculateShipping.addEventListener("click", calculateCartShipping);
els.deliveryPostalCode.addEventListener("input", () => {
  resetShippingQuote();
  const digits = els.deliveryPostalCode.value.replace(/\D/g, "").slice(0, 8);
  els.deliveryPostalCode.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  renderCart();
});
els.saveCheckoutEndpoint.addEventListener("click", () => {
  localStorage.setItem(checkoutEndpointKey, els.checkoutEndpointInput.value.trim());
  els.checkoutEndpointInput.value = localStorage.getItem(checkoutEndpointKey) || "";
});
fields.images.addEventListener("change", async () => {
  const selectedImages = [...fields.images.files].slice(0, 3);
  const uploaded = await Promise.all(selectedImages.map(fileToDataUrl));
  if (uploaded.length) renderImageSequence(uploaded);
});
els.resetDemo.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  products = demoProducts();
  products[0].similarIds = [products[2].id, products[1].id];
  products[1].similarIds = [products[0].id];
  products[2].similarIds = [products[0].id];
  saveProducts();
  clearForm();
  renderAll();
});

renderAll();
renderImageSequence();
renderCart();
setAdminVisible(isAdminLoggedIn());
applyHeroSettings();
applySiteSettings();
syncProductsFromDatabase();
syncSettingsFromDatabase();
window.addEventListener("storage", (event) => {
  if (event.key === heroSettingsKey) applyHeroSettings();
  if (event.key === siteSettingsKey) applySiteSettings();
});
