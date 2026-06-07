const productKey = "atelier-products-v1";
const usersKey = "atelier-admin-users-v1";
const sessionKey = "atelier-admin-site-session";
const checkoutEndpointKey = "atelier-checkout-endpoint";

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
  photoSequence: document.querySelector("#photoSequence"),
  similarInput: document.querySelector("#similarInput"),
  userForm: document.querySelector("#userForm"),
  userList: document.querySelector("#userList"),
  userCount: document.querySelector("#userCount"),
  checkoutEndpointInput: document.querySelector("#checkoutEndpointInput"),
  saveCheckoutEndpoint: document.querySelector("#saveCheckoutEndpoint"),
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

let products = loadProducts();
let users = loadUsers();

function loadProducts() {
  const saved = localStorage.getItem(productKey);
  return saved ? JSON.parse(saved) : [];
}

function saveProducts() {
  localStorage.setItem(productKey, JSON.stringify(products));
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

function currentUser() {
  const id = localStorage.getItem(sessionKey);
  return users.find((user) => user.id === id);
}

function setAuthenticated(user) {
  if (user) {
    localStorage.setItem(sessionKey, user.id);
    els.loginScreen.hidden = true;
    els.adminApp.hidden = false;
    els.sessionUser.textContent = `${user.name} · ${user.role}`;
    els.checkoutEndpointInput.value = localStorage.getItem(checkoutEndpointKey) || "";
    renderAll();
  } else {
    localStorage.removeItem(sessionKey);
    els.loginScreen.hidden = false;
    els.adminApp.hidden = true;
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

async function saveProduct(event) {
  event.preventDefault();
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

function switchView(view) {
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  els.views.forEach((panel) => panel.classList.toggle("active", panel.id === `${view}View`));
  els.viewTitle.textContent = view === "products" ? "Obras e estoque" : view === "users" ? "Usuários" : "Pagamentos";
}

function renderAll() {
  renderProducts();
  renderUsers();
  renderPhotoSequence();
  renderSimilarSelect();
}

els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = users.find((item) => item.login === els.loginUser.value.trim() && item.password === els.loginPassword.value);
  if (!user) {
    els.loginError.textContent = "Usuário ou senha incorretos.";
    return;
  }
  els.loginError.textContent = "";
  setAuthenticated(user);
});

els.logoutButton.addEventListener("click", () => setAuthenticated(null));
els.tabs.forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
els.productForm.addEventListener("submit", saveProduct);
document.querySelector("#newProduct").addEventListener("click", clearProductForm);
productFields.images.addEventListener("change", async () => {
  const uploaded = await Promise.all([...productFields.images.files].slice(0, 3).map(fileToDataUrl));
  renderPhotoSequence(uploaded);
});
els.userForm.addEventListener("submit", saveUser);
document.querySelector("#newUser").addEventListener("click", clearUserForm);
els.saveCheckoutEndpoint.addEventListener("click", () => {
  localStorage.setItem(checkoutEndpointKey, els.checkoutEndpointInput.value.trim());
});

setAuthenticated(currentUser());
