const storageKey = "atelier-products-v1";
const cartKey = "atelier-cart-v1";
const adminSessionKey = "atelier-admin-session";
const checkoutEndpointKey = "atelier-checkout-endpoint";
const adminPassword = "atelier2026";
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
  cartTotal: document.querySelector("#cartTotal"),
  checkoutButton: document.querySelector("#checkoutButton"),
  checkoutNote: document.querySelector("#checkoutNote"),
  checkoutEndpointInput: document.querySelector("#checkoutEndpointInput"),
  saveCheckoutEndpoint: document.querySelector("#saveCheckoutEndpoint"),
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
  saveCart();
  renderCart();
  els.cartDrawer.showModal();
}

function removeFromCart(id) {
  cart = cart.filter((itemId) => itemId !== id);
  saveCart();
  renderCart();
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
  const total = items.reduce((sum, product) => sum + Number(product.price), 0);
  els.cartTotal.textContent = money.format(total);
  els.checkoutButton.disabled = items.length === 0;
  els.checkoutNote.textContent = "";
  els.cartItems.querySelectorAll("[data-remove-cart]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.removeCart));
  });
}

async function startCheckout() {
  const items = cartProducts();
  if (!items.length) return;
  const endpoint = localStorage.getItem(checkoutEndpointKey);
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
    if (!response.ok || !checkoutUrl) throw new Error("Resposta de checkout inválida.");
    window.location.href = checkoutUrl;
  } catch (error) {
    els.checkoutNote.textContent = "Não foi possível iniciar o pagamento. Confira o endpoint Mercado Pago no painel reservado.";
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
      startCheckout();
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
els.checkoutButton.addEventListener("click", startCheckout);
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
