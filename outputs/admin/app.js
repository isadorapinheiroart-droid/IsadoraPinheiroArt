const productKey = "atelier-products-v1";
const usersKey = "atelier-admin-users-v1";
const sessionKey = "atelier-admin-site-session";
const checkoutEndpointKey = "atelier-checkout-endpoint";
const heroSettingsKey = "atelier-hero-settings-v1";
const siteSettingsKey = "atelier-site-settings-v1";
const publicConfig = window.ATELIER_CONFIG || {};
const stateEndpoint = publicConfig.stateEndpoint || "/api/state";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const els = {
  loginScreen: document.querySelector("#loginScreen"),
  adminApp: document.querySelector("#adminApp"),
  loginForm: document.querySelector("#loginForm"),
  loginUser: document.querySelector("#loginUser"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  sessionUser: document.querySelector("#sessionUser"),
  logoutButton: document.querySelector("#logoutButton"),
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  viewTitle: document.querySelector("#viewTitle"),
  productForm: document.querySelector("#productForm"),
  productList: document.querySelector("#productList"),
  productCount: document.querySelector("#productCount"),
  syncDatabase: document.querySelector("#syncDatabase"),
  databaseStatus: document.querySelector("#databaseStatus"),
  orderList: document.querySelector("#ordersList"),
  orderCount: document.querySelector("#orderCount"),
  ordersStatus: document.querySelector("#ordersStatus"),
  refreshOrders: document.querySelector("#refreshOrders"),
  photoSequence: document.querySelector("#photoSequence"),
  similarInput: document.querySelector("#similarInput"),
  userForm: document.querySelector("#userForm"),
  userList: document.querySelector("#userList"),
  userCount: document.querySelector("#userCount"),
  checkoutEndpointInput: document.querySelector("#checkoutEndpointInput"),
  saveCheckoutEndpoint: document.querySelector("#saveCheckoutEndpoint"),
  heroImageInput: document.querySelector("#heroImageInput"),
  heroPreview: document.querySelector("#heroPreview"),
  heroXInput: document.querySelector("#heroXInput"),
  heroYInput: document.querySelector("#heroYInput"),
  heroScaleInput: document.querySelector("#heroScaleInput"),
  saveHeroSettings: document.querySelector("#saveHeroSettings"),
  resetHeroSettings: document.querySelector("#resetHeroSettings"),
  navHomeInput: document.querySelector("#navHomeInput"),
  navAboutInput: document.querySelector("#navAboutInput"),
  navWorksInput: document.querySelector("#navWorksInput"),
  navCartInput: document.querySelector("#navCartInput"),
  navBrandInput: document.querySelector("#navBrandInput"),
  navXInput: document.querySelector("#navXInput"),
  navYInput: document.querySelector("#navYInput"),
  navScaleInput: document.querySelector("#navScaleInput"),
  servicesSubtitleInput: document.querySelector("#servicesSubtitleInput"),
  servicesTitleInput: document.querySelector("#servicesTitleInput"),
  servicesTextInput: document.querySelector("#servicesTextInput"),
  processSubtitleInput: document.querySelector("#processSubtitleInput"),
  processTitleInput: document.querySelector("#processTitleInput"),
  processTextInput: document.querySelector("#processTextInput"),
  contactSubtitleInput: document.querySelector("#contactSubtitleInput"),
  contactTitleInput: document.querySelector("#contactTitleInput"),
  contactTextInput: document.querySelector("#contactTextInput"),
  worksScaleInput: document.querySelector("#worksScaleInput"),
  saveSiteSettings: document.querySelector("#saveSiteSettings"),
  resetNavSettings: document.querySelector("#resetNavSettings"),
  resetServicesSettings: document.querySelector("#resetServicesSettings"),
  resetProcessSettings: document.querySelector("#resetProcessSettings"),
  resetContactSettings: document.querySelector("#resetContactSettings"),
  resetWorksSettings: document.querySelector("#resetWorksSettings"),
  resetSiteSettings: document.querySelector("#resetSiteSettings"),
  shippingEnabledInput: document.querySelector("#shippingEnabledInput"),
  shippingAdditionalItemFee: document.querySelector("#shippingAdditionalItemFee"),
  shippingFreeThreshold: document.querySelector("#shippingFreeThreshold"),
  shippingSettingsStatus: document.querySelector("#shippingSettingsStatus"),
  saveShippingSettings: document.querySelector("#saveShippingSettings"),
};

const productFields = {
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
};

const userFields = {
  editing: document.querySelector("#editingUser"),
  name: document.querySelector("#userNameInput"),
  login: document.querySelector("#userLoginInput"),
  password: document.querySelector("#userPasswordInput"),
  role: document.querySelector("#userRoleInput"),
};

const shippingRateFields = {
  north: {
    price: document.querySelector("#shippingNorthPrice"),
    minDays: document.querySelector("#shippingNorthMin"),
    maxDays: document.querySelector("#shippingNorthMax"),
  },
  northeast: {
    price: document.querySelector("#shippingNortheastPrice"),
    minDays: document.querySelector("#shippingNortheastMin"),
    maxDays: document.querySelector("#shippingNortheastMax"),
  },
  centerWest: {
    price: document.querySelector("#shippingCenterWestPrice"),
    minDays: document.querySelector("#shippingCenterWestMin"),
    maxDays: document.querySelector("#shippingCenterWestMax"),
  },
  southeast: {
    price: document.querySelector("#shippingSoutheastPrice"),
    minDays: document.querySelector("#shippingSoutheastMin"),
    maxDays: document.querySelector("#shippingSoutheastMax"),
  },
  south: {
    price: document.querySelector("#shippingSouthPrice"),
    minDays: document.querySelector("#shippingSouthMin"),
    maxDays: document.querySelector("#shippingSouthMax"),
  },
};

let products = loadProducts();
let users = loadUsers();
let pendingHeroImage = "";
let authenticatedUser = null;

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

function loadProducts() {
  const saved = localStorage.getItem(productKey);
  return saved ? JSON.parse(saved) : [];
}

function saveProducts() {
  localStorage.setItem(productKey, JSON.stringify(products));
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
    const response = await fetch(`${stateEndpoint}?key=${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!response.ok) throw new Error("Falha ao salvar no banco.");
    return true;
  } catch (error) {
    // O painel continua funcionando com localStorage se o banco ainda nao estiver conectado.
    return false;
  }
}

function showDatabaseStatus(message, type = "") {
  if (!els.databaseStatus) return;
  els.databaseStatus.textContent = message;
  els.databaseStatus.className = `sync-status ${type}`.trim();
}

async function syncLocalProductsToDatabase() {
  if (!products.length) {
    showDatabaseStatus("Nenhuma obra local para enviar ao banco.", "error");
    return;
  }

  if (els.syncDatabase) els.syncDatabase.disabled = true;
  showDatabaseStatus("Enviando obras para o banco...");

  const ok = await savePersistentValue("products", products);
  showDatabaseStatus(
    ok ? "Obras enviadas ao banco. Agora outros aparelhos conseguem ver." : "Nao foi possivel enviar ao banco. Confira DATABASE_URL na Vercel.",
    ok ? "success" : "error",
  );
  if (els.syncDatabase) els.syncDatabase.disabled = false;
}

async function syncProductsFromDatabase() {
  const remoteProducts = await loadPersistentValue("products");
  if (Array.isArray(remoteProducts)) {
    products = remoteProducts;
    localStorage.setItem(productKey, JSON.stringify(products));
    renderAll();
    return;
  }

  if (products.length) {
    const ok = await savePersistentValue("products", products);
    showDatabaseStatus(
      ok ? "Obras locais sincronizadas com o banco." : "Banco indisponivel. As obras ainda estao apenas neste navegador.",
      ok ? "success" : "error",
    );
  }
}

function loadUsers() {
  const saved = localStorage.getItem(usersKey);
  if (saved) return JSON.parse(saved);
  const initial = [{
    id: crypto.randomUUID(),
    name: "Administrador",
    login: "admin",
    password: "admin123",
    role: "admin",
  }];
  localStorage.setItem(usersKey, JSON.stringify(initial));
  return initial;
}

function saveUsers() {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

function loadHeroSettings() {
  const saved = localStorage.getItem(heroSettingsKey);
  return saved ? JSON.parse(saved) : { image: "", x: 50, y: 0, scale: 100 };
}

function saveHeroSettings(settings) {
  localStorage.setItem(heroSettingsKey, JSON.stringify(settings));
  savePersistentValue("hero-settings", settings);
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

function saveSiteSettings(settings) {
  localStorage.setItem(siteSettingsKey, JSON.stringify(settings));
  savePersistentValue("site-settings", settings);
}

async function syncSettingsFromDatabase() {
  const [heroSettings, siteSettings] = await Promise.all([
    loadPersistentValue("hero-settings"),
    loadPersistentValue("site-settings"),
  ]);

  if (heroSettings) {
    localStorage.setItem(heroSettingsKey, JSON.stringify(heroSettings));
    applyHeroPreview(heroSettings);
  }

  if (siteSettings) {
    localStorage.setItem(siteSettingsKey, JSON.stringify(siteSettings));
    populateSiteSettings(siteSettings);
  }
}

function fillShippingSettings(settings) {
  els.shippingEnabledInput.checked = Boolean(settings.enabled);
  els.shippingAdditionalItemFee.value = Number(settings.additionalItemFee || 0).toFixed(2);
  els.shippingFreeThreshold.value = Number(settings.freeShippingThreshold || 0).toFixed(2);
  Object.entries(shippingRateFields).forEach(([region, fields]) => {
    const rate = settings.rates?.[region] || {};
    fields.price.value = Number(rate.price || 0).toFixed(2);
    fields.minDays.value = Number(rate.minDays || 1);
    fields.maxDays.value = Number(rate.maxDays || rate.minDays || 1);
  });
}

function readShippingSettings() {
  const rates = {};
  Object.entries(shippingRateFields).forEach(([region, fields]) => {
    rates[region] = {
      price: Number(fields.price.value || 0),
      minDays: Number(fields.minDays.value || 1),
      maxDays: Number(fields.maxDays.value || fields.minDays.value || 1),
    };
  });
  return {
    enabled: els.shippingEnabledInput.checked,
    additionalItemFee: Number(els.shippingAdditionalItemFee.value || 0),
    freeShippingThreshold: Number(els.shippingFreeThreshold.value || 0),
    rates,
  };
}

async function loadShippingSettingsForm() {
  try {
    const response = await fetch("/api/admin-shipping", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (!response.ok) throw new Error("Não foi possível carregar o frete.");
    const data = await response.json();
    fillShippingSettings(data.settings || {});
  } catch (error) {
    els.shippingSettingsStatus.textContent = error.message;
    els.shippingSettingsStatus.className = "sync-status error";
  }
}

async function saveShippingSettingsForm() {
  els.saveShippingSettings.disabled = true;
  els.shippingSettingsStatus.textContent = "Salvando configuração...";
  els.shippingSettingsStatus.className = "sync-status";
  try {
    const response = await fetch("/api/admin-shipping", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ settings: readShippingSettings() }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Não foi possível salvar o frete.");
    fillShippingSettings(data.settings);
    els.shippingSettingsStatus.textContent = data.settings.enabled
      ? "Frete ativado e pronto para consulta no site."
      : "Configuração salva. O frete continua desativado no site.";
    els.shippingSettingsStatus.className = "sync-status success";
  } catch (error) {
    els.shippingSettingsStatus.textContent = error.message;
    els.shippingSettingsStatus.className = "sync-status error";
  } finally {
    els.saveShippingSettings.disabled = false;
  }
}

function applyHeroPreview(settings = loadHeroSettings()) {
  const image = pendingHeroImage || settings.image;
  if (image) document.documentElement.style.setProperty("--admin-hero-image", `url("${image}")`);
  else document.documentElement.style.removeProperty("--admin-hero-image");
  document.documentElement.style.setProperty("--admin-hero-pos-x", `${settings.x ?? 50}%`);
  document.documentElement.style.setProperty("--admin-hero-pos-y", `${settings.y ?? 0}%`);
  document.documentElement.style.setProperty("--admin-hero-size", `${settings.scale ?? 100}% auto`);
  els.heroXInput.value = settings.x ?? 50;
  els.heroYInput.value = settings.y ?? 0;
  els.heroScaleInput.value = settings.scale ?? 100;
}

function populateSiteSettings(settings = loadSiteSettings()) {
  els.navHomeInput.value = settings.nav.home;
  els.navAboutInput.value = settings.nav.about;
  els.navWorksInput.value = settings.nav.works;
  els.navCartInput.value = settings.nav.cart;
  els.navBrandInput.value = settings.nav.brand;
  els.navXInput.value = settings.nav.x;
  els.navYInput.value = settings.nav.y;
  els.navScaleInput.value = settings.nav.scale;
  els.servicesSubtitleInput.value = settings.sections.services.subtitle;
  els.servicesTitleInput.value = settings.sections.services.title;
  els.servicesTextInput.value = settings.sections.services.text;
  els.processSubtitleInput.value = settings.sections.process.subtitle;
  els.processTitleInput.value = settings.sections.process.title;
  els.processTextInput.value = settings.sections.process.text;
  els.contactSubtitleInput.value = settings.sections.contact.subtitle;
  els.contactTitleInput.value = settings.sections.contact.title;
  els.contactTextInput.value = settings.sections.contact.text;
  els.worksScaleInput.value = settings.works.scale;
  document.documentElement.style.setProperty("--admin-nav-scale", String((Number(settings.nav.scale) || 100) / 100));
  document.documentElement.style.setProperty("--admin-works-scale", String((Number(settings.works.scale) || 100) / 100));
}

function readSiteSettingsForm() {
  return mergeSiteSettings({
    nav: {
      home: els.navHomeInput.value.trim() || defaultSiteSettings.nav.home,
      about: els.navAboutInput.value.trim() || defaultSiteSettings.nav.about,
      works: els.navWorksInput.value.trim() || defaultSiteSettings.nav.works,
      cart: els.navCartInput.value.trim() || defaultSiteSettings.nav.cart,
      brand: els.navBrandInput.value.trim() || defaultSiteSettings.nav.brand,
      x: Number(els.navXInput.value),
      y: Number(els.navYInput.value),
      scale: Number(els.navScaleInput.value),
    },
    sections: {
      services: {
        subtitle: els.servicesSubtitleInput.value.trim() || defaultSiteSettings.sections.services.subtitle,
        title: els.servicesTitleInput.value.trim() || defaultSiteSettings.sections.services.title,
        text: els.servicesTextInput.value.trim() || defaultSiteSettings.sections.services.text,
      },
      process: {
        subtitle: els.processSubtitleInput.value.trim() || defaultSiteSettings.sections.process.subtitle,
        title: els.processTitleInput.value.trim() || defaultSiteSettings.sections.process.title,
        text: els.processTextInput.value.trim() || defaultSiteSettings.sections.process.text,
      },
      contact: {
        subtitle: els.contactSubtitleInput.value.trim() || defaultSiteSettings.sections.contact.subtitle,
        title: els.contactTitleInput.value.trim() || defaultSiteSettings.sections.contact.title,
        text: els.contactTextInput.value.trim() || defaultSiteSettings.sections.contact.text,
      },
    },
    works: {
      scale: Number(els.worksScaleInput.value),
    },
  });
}

function applyAndSaveSiteSettings(settings) {
  saveSiteSettings(settings);
  populateSiteSettings(settings);
}

function restoreSitePart(part) {
  const settings = readSiteSettingsForm();
  if (part === "nav") settings.nav = { ...defaultSiteSettings.nav };
  if (part === "services") settings.sections.services = { ...defaultSiteSettings.sections.services };
  if (part === "process") settings.sections.process = { ...defaultSiteSettings.sections.process };
  if (part === "contact") settings.sections.contact = { ...defaultSiteSettings.sections.contact };
  if (part === "works") settings.works = { ...defaultSiteSettings.works };
  applyAndSaveSiteSettings(settings);
}

function currentUser() {
  return authenticatedUser;
}

function requireAuth() {
  const user = currentUser();
  if (!user) setAuthenticated(null);
  return Boolean(user);
}

function setAuthenticated(user) {
  authenticatedUser = user || null;
  if (user) {
    localStorage.removeItem(sessionKey);
    els.loginScreen.hidden = true;
    els.adminApp.hidden = false;
    document.body.classList.remove("locked");
    els.sessionUser.textContent = `${user.name} · ${user.role}`;
    els.checkoutEndpointInput.value = localStorage.getItem(checkoutEndpointKey) || "";
    applyHeroPreview();
    populateSiteSettings();
    renderAll();
    syncProductsFromDatabase();
    syncSettingsFromDatabase();
    loadShippingSettingsForm();
    loadOrders();
  } else {
    localStorage.removeItem(sessionKey);
    els.loginScreen.hidden = false;
    els.adminApp.hidden = true;
    document.body.classList.add("locked");
  }
}

async function restoreAdminSession() {
  try {
    const response = await fetch("/api/admin-session", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (!response.ok) throw new Error("Sessao indisponivel.");
    const data = await response.json();
    setAuthenticated(data.user);
  } catch {
    setAuthenticated(null);
  }
}

function artSvg(title) {
  const safeTitle = title || "Obra";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1120"><rect width="900" height="1120" fill="#edf4f2"/><rect x="86" y="76" width="728" height="968" rx="22" fill="#fffdf8" stroke="#222831" stroke-width="18"/><path d="M130 842 C258 590 318 720 424 405 C536 598 626 392 760 710 L760 990 L130 990Z" fill="#1f7a6b"/><circle cx="635" cy="250" r="108" fill="#f1b84b"/><text x="450" y="1065" text-anchor="middle" font-family="Arial" font-size="36" font-weight="700" fill="#222831">${safeTitle}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderPhotoSequence(images = []) {
  const labels = ["Foto principal", "Foto 2", "Foto 3"];
  const text = ["Imagem da galeria e destaque do produto.", "Segunda foto demonstrativa.", "Terceira foto demonstrativa."];
  els.photoSequence.innerHTML = labels.map((label, index) => `
    <article class="photo-card">
      ${images[index] ? `<img src="${images[index]}" alt="${label}">` : `<span>Sem foto</span>`}
      <strong>${label}</strong>
      <p>${text[index]}</p>
    </article>
  `).join("");
}

function renderSimilarSelect(currentId = "", selected = []) {
  els.similarInput.innerHTML = products
    .filter((product) => product.id !== currentId)
    .map((product) => `<option value="${product.id}" ${selected.includes(product.id) ? "selected" : ""}>${product.title}</option>`)
    .join("");
}

function renderProducts() {
  if (!requireAuth()) return;
  els.productCount.textContent = `${products.length} obras`;
  els.productList.innerHTML = products.map((product) => `
    <div class="row">
      <div>
        <h4>${product.title}</h4>
        <p class="meta">${product.stock} un. · ${product.material} · ${money.format(Number(product.price || 0))}</p>
      </div>
      <div class="row-actions">
        <button type="button" data-edit-product="${product.id}">Editar</button>
        <button class="danger" type="button" data-delete-product="${product.id}">Excluir</button>
      </div>
    </div>
  `).join("") || `<p class="meta">Nenhuma obra cadastrada.</p>`;

  els.productList.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", () => editProduct(button.dataset.editProduct));
  });
  els.productList.querySelectorAll("[data-delete-product]").forEach((button) => {
    button.addEventListener("click", () => {
      products = products.filter((product) => product.id !== button.dataset.deleteProduct);
      products.forEach((product) => {
        product.similarIds = (product.similarIds || []).filter((id) => id !== button.dataset.deleteProduct);
      });
      saveProducts();
      clearProductForm();
      renderAll();
    });
  });
}

function editProduct(id) {
  if (!requireAuth()) return;
  const product = products.find((item) => item.id === id);
  if (!product) return;
  productFields.id.value = product.id;
  productFields.title.value = product.title || "";
  productFields.collection.value = product.collection || "";
  productFields.color.value = product.color || "";
  productFields.material.value = product.material || "";
  productFields.paint.value = product.paint || "";
  productFields.height.value = product.height || "";
  productFields.width.value = product.width || "";
  productFields.depth.value = product.depth || "";
  productFields.stock.value = product.stock || 0;
  productFields.price.value = product.price || 0;
  productFields.description.value = product.description || "";
  productFields.images.value = "";
  renderPhotoSequence(product.images || []);
  renderSimilarSelect(product.id, product.similarIds || []);
  productFields.title.focus();
}

function clearProductForm() {
  els.productForm.reset();
  productFields.id.value = "";
  renderPhotoSequence();
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

function heroFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 1800;
        const ratio = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function saveProduct(event) {
  event.preventDefault();
  if (!requireAuth()) return;
  const id = productFields.id.value || crypto.randomUUID();
  const existing = products.find((product) => product.id === id);
  const selectedImages = [...productFields.images.files].slice(0, 3);
  const uploaded = await Promise.all(selectedImages.map(fileToDataUrl));
  const product = {
    id,
    title: productFields.title.value.trim(),
    collection: productFields.collection.value.trim(),
    color: productFields.color.value.trim().toLowerCase(),
    material: productFields.material.value.trim(),
    paint: productFields.paint.value.trim(),
    height: Number(productFields.height.value),
    width: Number(productFields.width.value),
    depth: Number(productFields.depth.value),
    stock: Number(productFields.stock.value),
    price: Number(productFields.price.value),
    description: productFields.description.value.trim(),
    images: uploaded.length ? uploaded : existing?.images || [artSvg(productFields.title.value.trim())],
    similarIds: [...els.similarInput.selectedOptions].map((option) => option.value),
  };

  products = existing ? products.map((item) => item.id === id ? product : item) : [...products, product];
  saveProducts();
  clearProductForm();
  renderAll();
}

function renderUsers() {
  if (!requireAuth()) return;
  els.userCount.textContent = `${users.length} usuários`;
  els.userList.innerHTML = users.map((user) => `
    <div class="row">
      <div>
        <h4>${user.name}</h4>
        <p class="meta">${user.login} · ${user.role}</p>
      </div>
      <div class="row-actions">
        <button type="button" data-edit-user="${user.id}">Editar</button>
        <button class="danger" type="button" data-delete-user="${user.id}">Excluir</button>
      </div>
    </div>
  `).join("");

  els.userList.querySelectorAll("[data-edit-user]").forEach((button) => {
    button.addEventListener("click", () => editUser(button.dataset.editUser));
  });
  els.userList.querySelectorAll("[data-delete-user]").forEach((button) => {
    button.addEventListener("click", () => {
      if (users.length === 1) return;
      users = users.filter((user) => user.id !== button.dataset.deleteUser);
      saveUsers();
      clearUserForm();
      renderUsers();
    });
  });
}

function editUser(id) {
  if (!requireAuth()) return;
  const user = users.find((item) => item.id === id);
  if (!user) return;
  userFields.editing.value = user.id;
  userFields.name.value = user.name;
  userFields.login.value = user.login;
  userFields.password.value = user.password;
  userFields.role.value = user.role;
  userFields.name.focus();
}

function clearUserForm() {
  els.userForm.reset();
  userFields.editing.value = "";
  userFields.role.value = "editor";
}

function saveUser(event) {
  event.preventDefault();
  if (!requireAuth()) return;
  const id = userFields.editing.value || crypto.randomUUID();
  const duplicate = users.find((user) => user.login === userFields.login.value.trim() && user.id !== id);
  if (duplicate) {
    alert("Este usuário de login já existe.");
    return;
  }
  const user = {
    id,
    name: userFields.name.value.trim(),
    login: userFields.login.value.trim(),
    password: userFields.password.value,
    role: userFields.role.value,
  };
  users = users.some((item) => item.id === id) ? users.map((item) => item.id === id ? user : item) : [...users, user];
  saveUsers();
  clearUserForm();
  renderUsers();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;",
  })[character]);
}

function orderStatusLabel(status) {
  const labels = {
    approved: "Pago",
    pending_payment: "Aguardando pagamento",
    creating_payment: "Criando pagamento",
    pending: "Pagamento pendente",
    in_process: "Em análise",
    rejected: "Pagamento recusado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    charged_back: "Contestado",
    checkout_error: "Checkout não concluído",
    payment_review: "Verificar pagamento",
  };
  return labels[status] || "Aguardando atualização";
}

function formatOrderDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPostalCode(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return digits || "Não informado";
}

function renderOrders(orders) {
  els.orderCount.textContent = `${orders.length} ${orders.length === 1 ? "pedido" : "pedidos"}`;
  if (!orders.length) {
    els.orderList.innerHTML = `<div class="empty-orders">Nenhum pedido foi iniciado ainda.</div>`;
    return;
  }

  els.orderList.innerHTML = orders.map((order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const reference = order.reference_point
      ? `<p><strong>Referência:</strong> ${escapeHtml(order.reference_point)}</p>`
      : "";
    const paymentId = order.mp_payment_id
      ? `<p><strong>Pagamento MP:</strong> ${escapeHtml(order.mp_payment_id)}</p>`
      : `<p>O cliente ainda não concluiu o pagamento.</p>`;
    const payerEmail = order.payer_email && order.payer_email !== order.customer_email
      ? `<p><strong>E-mail Mercado Pago:</strong> ${escapeHtml(order.payer_email)}</p>`
      : "";
    const shippingPrice = Number(order.shipping_price || 0);
    const shippingDeadline = order.shipping_min_days
      ? order.shipping_min_days === order.shipping_max_days
        ? `${order.shipping_min_days} dias úteis`
        : `${order.shipping_min_days} a ${order.shipping_max_days} dias úteis`
      : "Não informado";

    return `
      <article class="order-card">
        <header class="order-card-head">
          <div>
            <h4>Pedido ${escapeHtml(order.order_code)}</h4>
            <p class="meta">Criado em ${escapeHtml(formatOrderDate(order.created_at))}</p>
          </div>
          <span class="order-status ${escapeHtml(order.status)}">${escapeHtml(orderStatusLabel(order.status))}</span>
        </header>
        <div class="order-details">
          <section>
            <h5>Cliente e entrega</h5>
            <p><strong>${escapeHtml(order.customer_name)}</strong></p>
            <p><strong>E-mail:</strong> ${escapeHtml(order.customer_email || "Não informado")}</p>
            <p><strong>Telefone:</strong> ${escapeHtml(formatPhone(order.customer_phone))}</p>
            <address>
              ${escapeHtml(order.delivery_address)}<br>
              Número / apartamento: ${escapeHtml(order.address_number)}<br>
              CEP: ${escapeHtml(formatPostalCode(order.postal_code))}
            </address>
            ${reference}
          </section>
          <section>
            <h5>Obras compradas</h5>
            <ul class="order-items">
              ${items.map((item) => `
                <li>${escapeHtml(item.title)} · ${Number(item.quantity) || 1} un. · ${escapeHtml(money.format(Number(item.unit_price) || 0))}</li>
              `).join("")}
            </ul>
          </section>
          <section>
            <h5>Pagamento</h5>
            <p><strong>Obras:</strong> ${escapeHtml(money.format(Math.max(0, Number(order.total) - shippingPrice)))}</p>
            <p><strong>Frete:</strong> ${order.shipping_region ? shippingPrice === 0 ? "Grátis" : escapeHtml(money.format(shippingPrice)) : "Não configurado"}</p>
            ${order.shipping_region ? `<p><strong>Entrega:</strong> ${escapeHtml(order.shipping_region)} · ${escapeHtml(shippingDeadline)}</p>` : ""}
            <p><strong>Total:</strong> ${escapeHtml(money.format(Number(order.total) || 0))}</p>
            <p><strong>Status:</strong> ${escapeHtml(orderStatusLabel(order.status))}</p>
            ${paymentId}
            ${payerEmail}
            ${order.paid_at ? `<p><strong>Pago em:</strong> ${escapeHtml(formatOrderDate(order.paid_at))}</p>` : ""}
          </section>
        </div>
      </article>
    `;
  }).join("");
}

async function loadOrders() {
  if (!authenticatedUser || !els.orderList) return;
  els.refreshOrders.disabled = true;
  els.ordersStatus.textContent = "Atualizando pedidos...";
  els.ordersStatus.className = "sync-status";

  try {
    const response = await fetch("/api/orders", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (response.status === 401) {
      setAuthenticated(null);
      return;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Não foi possível carregar os pedidos.");
    renderOrders(Array.isArray(data.orders) ? data.orders : []);
    els.ordersStatus.textContent = `Última atualização: ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    els.ordersStatus.className = "sync-status success";
  } catch (error) {
    els.ordersStatus.textContent = error.message;
    els.ordersStatus.className = "sync-status error";
  } finally {
    els.refreshOrders.disabled = false;
  }
}

function switchView(view) {
  if (!requireAuth()) return;
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  els.views.forEach((panel) => panel.classList.toggle("active", panel.id === `${view}View`));
  const titles = {
    products: "Obras e estoque",
    orders: "Pedidos",
    users: "Usuários",
    settings: "Configurações",
  };
  els.viewTitle.textContent = titles[view] || "Painel";
  if (view === "orders") loadOrders();
}

function renderAll() {
  if (!requireAuth()) return;
  renderProducts();
  renderUsers();
  renderPhotoSequence();
  renderSimilarSelect();
}

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.loginError.textContent = "Entrando...";
  try {
    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        username: els.loginUser.value.trim(),
        password: els.loginPassword.value,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Usuário ou senha incorretos.");
    els.loginError.textContent = "";
    els.loginPassword.value = "";
    setAuthenticated(data.user);
  } catch (error) {
    els.loginError.textContent = error.message;
  }
});

els.logoutButton.addEventListener("click", async () => {
  await fetch("/api/admin-logout", { method: "POST", credentials: "same-origin" });
  setAuthenticated(null);
});
els.tabs.forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
els.refreshOrders?.addEventListener("click", loadOrders);
els.productForm.addEventListener("submit", saveProduct);
document.querySelector("#newProduct").addEventListener("click", clearProductForm);
els.syncDatabase?.addEventListener("click", syncLocalProductsToDatabase);
productFields.images.addEventListener("change", async () => {
  const uploaded = await Promise.all([...productFields.images.files].slice(0, 3).map(fileToDataUrl));
  renderPhotoSequence(uploaded);
});
els.userForm.addEventListener("submit", saveUser);
document.querySelector("#newUser").addEventListener("click", clearUserForm);
els.saveCheckoutEndpoint.addEventListener("click", () => {
  localStorage.setItem(checkoutEndpointKey, els.checkoutEndpointInput.value.trim());
});
els.heroImageInput.addEventListener("change", async () => {
  const file = els.heroImageInput.files[0];
  if (!file) return;
  pendingHeroImage = await heroFileToDataUrl(file);
  applyHeroPreview(loadHeroSettings());
});
[els.heroXInput, els.heroYInput, els.heroScaleInput].forEach((input) => {
  input.addEventListener("input", () => {
    applyHeroPreview({
      ...loadHeroSettings(),
      x: Number(els.heroXInput.value),
      y: Number(els.heroYInput.value),
      scale: Number(els.heroScaleInput.value),
    });
  });
});
els.saveHeroSettings.addEventListener("click", () => {
  const existing = loadHeroSettings();
  const settings = {
    image: pendingHeroImage || existing.image,
    x: Number(els.heroXInput.value),
    y: Number(els.heroYInput.value),
    scale: Number(els.heroScaleInput.value),
  };
  saveHeroSettings(settings);
  pendingHeroImage = "";
  els.heroImageInput.value = "";
  applyHeroPreview(settings);
});
els.resetHeroSettings.addEventListener("click", () => {
  localStorage.removeItem(heroSettingsKey);
  pendingHeroImage = "";
  els.heroImageInput.value = "";
  const settings = loadHeroSettings();
  savePersistentValue("hero-settings", settings);
  applyHeroPreview(settings);
});
[
  els.navXInput,
  els.navYInput,
  els.navScaleInput,
  els.worksScaleInput,
].forEach((input) => {
  input.addEventListener("input", () => {
    const settings = readSiteSettingsForm();
    document.documentElement.style.setProperty("--admin-nav-scale", String((Number(settings.nav.scale) || 100) / 100));
    document.documentElement.style.setProperty("--admin-works-scale", String((Number(settings.works.scale) || 100) / 100));
  });
});
els.saveSiteSettings.addEventListener("click", () => {
  const settings = readSiteSettingsForm();
  applyAndSaveSiteSettings(settings);
});
els.resetNavSettings.addEventListener("click", () => restoreSitePart("nav"));
els.resetServicesSettings.addEventListener("click", () => restoreSitePart("services"));
els.resetProcessSettings.addEventListener("click", () => restoreSitePart("process"));
els.resetContactSettings.addEventListener("click", () => restoreSitePart("contact"));
els.resetWorksSettings.addEventListener("click", () => restoreSitePart("works"));
els.resetSiteSettings.addEventListener("click", () => {
  localStorage.removeItem(siteSettingsKey);
  const settings = loadSiteSettings();
  savePersistentValue("site-settings", settings);
  populateSiteSettings(settings);
});
els.saveShippingSettings.addEventListener("click", saveShippingSettingsForm);

restoreAdminSession();

setInterval(() => {
  const ordersView = document.querySelector("#ordersView");
  if (authenticatedUser && ordersView?.classList.contains("active")) loadOrders();
}, 30000);
