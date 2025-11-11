import { API_BASE, toast } from "./scripts-base.js";

// --------- ROUTES API ----------
const ROUTES = {
  index: `${API_BASE}/?route=orders.list`,
  create: `${API_BASE}/?route=orders.create`,
  edit: (id) => `${API_BASE}/?route=orders.edit&id=${encodeURIComponent(id)}`,
  delete: (id) => `${API_BASE}/?route=orders.delete&id=${encodeURIComponent(id)}`,
  show: (id) => `${API_BASE}/?route=orders.show&id=${encodeURIComponent(id)}`,
  export: `${API_BASE}/?route=orders.export`,
  products: `${API_BASE}/?route=products.list`,
};

const PRODUCTS = {
  indexProduct: `${API_BASE}/?route=product.index`,
};

const ROUTES_CUSTOMERS = {
  indexCustomer: `${API_BASE}/?route=customer.index`,
};

// --------- VARIABLES GLOBALES ----------
const orderCache = new Map();
const validStatuses = ["pending", "paid", "refunded", "cancelled"];
let orderPage = 1;
const ordersPerPage = 3;
let paginatedOrders = [];

// --------- UTILITAIRES ----------
function createInput(labelText, name, type = "text", value = "", step) {
  const label = document.createElement("label");
  label.className = "label";
  label.textContent = labelText;

  const input = document.createElement("input");
  input.className = "input";
  input.name = name;
  input.type = type;
  input.value = value ?? "";
  if (step) input.step = step;
  input.required = true;

  return { label, input };
}

// --------- API CALLS ----------
export async function fetchOrders() {
  const res = await fetch(ROUTES.index, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Erreur GET Orders");

  const data = await res.json();
  const rows = Array.isArray(data) ? data : data.data || [];

  orderCache.clear();
  rows.forEach(n => n?.id != null && orderCache.set(String(n.id), n));
  return rows;
}

async function createOrder(payload) {
  const body = new URLSearchParams({
    product_id: Number(payload.product_id) || 0,
    customer_id: Number(payload.customer_id) || 0,
    status: (payload.status || "pending").toString(),
    total: Number(payload.total) || 0,
    quantity: Number(payload.quantity) || 1
  });

  const res = await fetch(ROUTES.create, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body,
  });

  if (!res.ok) {
    let msg = "Erreur POST Order";
    try {
      const e = await res.json();
      msg = e.message || e.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function editOrder(id, payload) {
  const body = new URLSearchParams({
    customer_id: Number(payload.customer_id) || 0,
    status: (payload.status || "pending").toString(),
    total: Number(payload.total) || 0,
  });

  const res = await fetch(ROUTES.edit(id), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body,
  });

  if (!res.ok) {
    let msg = "Erreur EDIT Order";
    try {
      const e = await res.json();
      msg = e.message || e.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteOrder(id) {
  const res = await fetch(ROUTES.delete(id), { headers: { Accept: "application/json" } });
  if (!res.ok) {
    try {
      const e = await res.json();
      throw new Error(e.message || e.error || "Erreur DELETE Order");
    } catch {
      throw new Error("Erreur DELETE Order");
    }
  }
  return res.json();
}

// --- Fetch produits ---
let products = [];

async function fetchProducts() {
  try {
    const res = await fetch(PRODUCTS.indexProduct, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Erreur GET Products");
    const data = await res.json();
    products = Array.isArray(data) ? data : data.data || [];
    return products;
  } catch (err) {
    console.error("Erreur fetchProducts:", err);
    return [];
  }
}

// --- Remplir le select des produits ---
async function populateProductSelect(selectId = "product_id") {
  const select = document.getElementById(selectId);
  if (!select) return;

  const data = await fetchProducts();
  select.innerHTML =
    `<option value="">-- Choisir un produit --</option>` +
    data
      .map(
        (p) =>
          `<option value="${p.id}" data-price="${p.price}">
            ${p.title || "Produit"} - ${p.price}€
          </option>`
      )
      .join("");
}


// --- Fetch clients ---
async function fetchCustomers() {
  try {
    const res = await fetch(ROUTES_CUSTOMERS.indexCustomer, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Erreur GET Customers");
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (err) {
    console.error("Erreur fetchCustomers:", err);
    return [];
  }
}

async function populateCustomerSelect(selectId = "customerSelect") {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const customers = await fetchCustomers();
    select.innerHTML = `<option value="">-- Choisir un client --</option>` +
      customers.map(c => `<option value="${c.id}">${c.name || c.fullname || c.email}</option>`).join("");
  } catch (err) {
    console.error(err);
    select.innerHTML = `<option value="">Erreur chargement clients</option>`;
  }
}

// --------- TOTAL CALCUL AUTOMATIQUE ---------
async function updateTotal() {
  const productSelect = document.getElementById("product_id");
  const quantityInput = document.getElementById("quantity");
  const totalInput = document.getElementById("total");

  if (!productSelect || !quantityInput || !totalInput) return;

  const productId = productSelect.value;
  const quantity = parseInt(quantityInput.value) || 1;

  if (!productId) {
    totalInput.value = 0;
    return;
  }

  const products = await fetchProducts();
  const product = products.find(p => p.id == productId);
  totalInput.value = product ? (product.price * quantity).toFixed(2) : 0;
}

// --------- RENDER / UI ----------
export function renderItem(order) {
  const li = document.createElement("li");
  li.className = "list__item";
  li.dataset.id = String(order.id);

  const title = document.createElement("strong");
  title.textContent = `Commande #${order.id} | Total: ${order.total?.toFixed(2) ?? "N/A"}€`;

  const content = document.createElement("p");
  content.textContent = `Client ID: ${order.customer_id} | Statut: ${order.status || "N/D"}`;

  const small = document.createElement("small");
  small.className = "muted";
  const dt = order.created_at ? new Date(order.created_at) : null;
  small.textContent = dt && !isNaN(dt) ? dt.toLocaleString() : "";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = ".5rem";
  actions.style.marginTop = ".25rem";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn-ghost";
  editBtn.textContent = "Éditer";
  editBtn.dataset.action = "edit";
  editBtn.dataset.id = String(order.id);

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "btn btn-ghost";
  delBtn.textContent = "Supprimer";
  delBtn.dataset.action = "delete";
  delBtn.dataset.id = String(order.id);

  actions.append(editBtn, delBtn);
  li.append(title, content, small, actions);
  return li;
}

export function renderList(items) {
  const ul = document.getElementById("order-list");
  ul.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "list__empty";
    li.textContent = "Aucune commande.";
    ul.appendChild(li);
    return;
  }

  paginatedOrders = items;
  const start = (orderPage - 1) * ordersPerPage;
  const end = start + ordersPerPage;
  items.slice(start, end).forEach(order => ul.appendChild(renderItem(order)));

  renderPagination(items.length);
}

export function renderPagination(totalItems) {
  let pagination = document.getElementById("pagination");
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "pagination";
    document.getElementById("order-list").after(pagination);
  }

  pagination.innerHTML = "";
  const totalPages = Math.ceil(totalItems / ordersPerPage);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = i;
    if (i === orderPage) link.classList.add("active");
    link.addEventListener("click", (e) => {
      e.preventDefault();
      orderPage = i;
      renderList(paginatedOrders);
    });
    pagination.appendChild(link);
  }
}

function initSearch(inputSelector, cache, renderFn) {
  const input = document.querySelector(inputSelector);
  if (!input) return;

  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = Array.from(cache.values()).filter(order =>
      String(order.id).toLowerCase().includes(query) ||
      String(order.customer_id).toLowerCase().includes(query) ||
      (order.status || "").toLowerCase().includes(query) ||
      String(order.total ?? "").toLowerCase().includes(query)
    );
    orderPage = 1;
    renderFn(filtered);
  });
}

export function enterEditMode(li, order) {
  li.innerHTML = "";
  const form = document.createElement("form");
  form.className = "grid gap-2";

  const customerInput = createInput("ID Client", "customer_id", "number", order.customer_id);
  const totalInput = createInput("Total (€)", "total", "number", order.total, "0.01");

  const statusLabel = document.createElement("label");
  statusLabel.className = "label";
  statusLabel.textContent = "Statut";

  const statusSelect = document.createElement("select");
  statusSelect.className = "input";
  statusSelect.name = "status";
  statusSelect.required = true;
  const currentStatus = validStatuses.includes(String(order.status)) ? order.status : "pending";
  validStatuses.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s.charAt(0).toUpperCase() + s.slice(1);
    if (currentStatus === s) opt.selected = true;
    statusSelect.appendChild(opt);
  });

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = ".5rem";

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn";
  saveBtn.type = "submit";
  saveBtn.textContent = "Enregistrer";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn btn-ghost";
  cancelBtn.type = "button";
  cancelBtn.textContent = "Annuler";

  row.append(saveBtn, cancelBtn);
  form.append(customerInput.label, customerInput.input, statusLabel, statusSelect, totalInput.label, totalInput.input, row);
  li.append(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await editOrder(order.id, {
        customer_id: customerInput.input.value.trim(),
        status: statusSelect.value.trim(),
        total: totalInput.input.value.trim(),
      });
      renderList(await fetchOrders());
      toast("✅ Modifié", false, "orderFormMsg");
    } catch (err) {
      toast("❌ " + (err?.message || "Erreur édition"), true, "orderFormMsg");
    }
  });

  cancelBtn.addEventListener("click", () => {
    li.replaceWith(renderItem(orderCache.get(String(order.id)) || order));
  });
}

// --------- INIT ORDERS ----------
// export async function initOrders() {
//   const form = document.getElementById("OrderForm");
//   const refreshBtn = document.getElementById("refreshOrderBtn");
//   const listEl = document.getElementById("order-list");
//   const currentTheme = localStorage.getItem("theme") || "light";
//   document.body.setAttribute("data-theme", currentTheme);

//   try { renderList(await fetchOrders()); } 
//   catch (e) { console.error(e); toast("x Erreur au chargement des commandes.", true, "orderFormMsg"); }

//   await populateProductSelect();
//   await populateCustomerSelect();
//   initSearch("#orderSearchInput", orderCache, renderList);

//   // --- CALCUL TOTAL AU CHANGEMENT ---
//   const productSelect = document.getElementById("product_id");
//   const quantityInput = document.getElementById("quantity");
//   productSelect?.addEventListener("change", updateTotal);
//   quantityInput?.addEventListener("input", updateTotal);

//   // --- AJOUT COMMANDE ---
//   form?.addEventListener("submit", async (ev) => {
//     ev.preventDefault();
//     const fd = new FormData(form);

//     // Récupération du produit sélectionné
//     const productId = fd.get("product_id");
//     const product = products.find(p => p.id == productId); // récupère le bon produit
//     if (!product) {
//       toast("❌ Produit introuvable", true, "orderFormMsg");
//       return;
//     }

//     const payload = {
//       customer_id: fd.get("customer_id"),
//       status: fd.get("status"),
//       items: [
//         {
//           product_id: product.id,
//           quantity: Number(fd.get("quantity")),
//           unit_price: Number(product.price) // 👈 ICI le prix correct
//         }
//       ]
//     };

//     try {
//       await createOrder(payload);
//       form.reset();
//       renderList(await fetchOrders());
//       toast("✅ Commande ajoutée avec succès", false, "orderFormMsg");
//     } catch (e) {
//       toast("❌ " + e.message, true, "orderFormMsg");
//     }
//   });

//   refreshBtn?.addEventListener("click", async () => {
//     try {
//       renderList(await fetchOrders());
//       toast("Liste Commandes rafraîchie", false, "orderFormMsg");
//     } catch (e) {
//       console.error(e);
//       toast("x Echec rafraîchissement", true, "orderFormMsg");
//     }
//   });

//   listEl?.addEventListener("click", async (e) => {
//     const btn = e.target.closest("button[data-action]");
//     if (!btn) return;
//     const id = btn.dataset.id;
//     if (!id) return;

//     if (btn.dataset.action === "edit") {
//       const li = btn.closest("li");
//       const order = orderCache.get(String(id));
//       if (!li || !order) return;
//       enterEditMode(li, order);
//     }

//     if (btn.dataset.action === "delete") {
//       if (!confirm("Supprimer cette commande ?")) return;
//       try {
//         await deleteOrder(id);
//         renderList(await fetchOrders());
//         toast("🗑️ Supprimé", false, "orderFormMsg");
//       } catch (err) {
//         toast("❌ " + (err?.message || "Erreur suppression"), true, "orderFormMsg");
//       }
//     }
//   });

//   const themeToggle = document.getElementById("themeToggle");
//   themeToggle?.addEventListener("click", () => {
//     const root = document.body;
//     const newTheme = root.getAttribute("data-theme") === "light" ? "dark" : "light";
//     root.setAttribute("data-theme", newTheme);
//     localStorage.setItem("theme", newTheme);
//   });
// }

export async function initOrders() {
  const form = document.getElementById("OrderForm");
  const refreshBtn = document.getElementById("refreshOrderBtn");
  const listEl = document.getElementById("order-list");
  const currentTheme = localStorage.getItem("theme") || "light";
  document.body.setAttribute("data-theme", currentTheme);

  // --- Fetch et affichage initial des commandes ---
  try {
    renderList(await fetchOrders());
  } catch (e) {
    console.error(e);
    toast("❌ Erreur au chargement des commandes.", true, "orderFormMsg");
  }

  // --- Populate selects ---
  await populateProductSelect();
  await populateCustomerSelect();

  // --- Init recherche ---
  initSearch("#orderSearchInput", orderCache, renderList);

  // --- CALCUL TOTAL AU CHANGEMENT ---
  const productSelect = document.getElementById("product_id");
  const quantityInput = document.getElementById("quantity");
  const totalInput = document.getElementById("total");

  async function updateTotal() {
    if (!productSelect || !quantityInput || !totalInput) return;
    const productId = productSelect.value;
    const quantity = parseInt(quantityInput.value) || 1;
    if (!productId) {
      totalInput.value = 0;
      return;
    }
    const product = products.find(p => p.id == productId);
    totalInput.value = product ? (product.price * quantity).toFixed(2) : 0;
  }

  productSelect?.addEventListener("change", updateTotal);
  quantityInput?.addEventListener("input", updateTotal);

  // --- AJOUT COMMANDE ---
  form?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (!form) return;

    const fd = new FormData(form);
    const productId = fd.get("product_id");
    const product = products.find(p => p.id == productId);

    if (!product) {
      toast("❌ Produit introuvable", true, "orderFormMsg");
      return;
    }

    const payload = {
      customer_id: fd.get("customer_id"),
      status: fd.get("status"),
      items: [
        {
          product_id: product.id,
          quantity: Number(fd.get("quantity")),
          unit_price: Number(product.price)
        }
      ]
    };

    try {
      await createOrder(payload);
      form.reset();
      totalInput.value = 0;
      renderList(await fetchOrders());
      toast("✅ Commande ajoutée avec succès", false, "orderFormMsg");
    } catch (e) {
      toast("❌ " + (e?.message || "Erreur création commande"), true, "orderFormMsg");
    }
  });

  // --- Refresh commandes ---
  refreshBtn?.addEventListener("click", async () => {
    try {
      renderList(await fetchOrders());
      toast("✅ Liste Commandes rafraîchie", false, "orderFormMsg");
    } catch (e) {
      console.error(e);
      toast("❌ Echec rafraîchissement", true, "orderFormMsg");
    }
  });

  // --- Gestion Edit / Delete ---
  listEl?.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    if (btn.dataset.action === "edit") {
      const li = btn.closest("li");
      const order = orderCache.get(String(id));
      if (!li || !order) return;
      enterEditMode(li, order);
    }

    if (btn.dataset.action === "delete") {
      if (!confirm("Supprimer cette commande ?")) return;
      try {
        await deleteOrder(id);
        renderList(await fetchOrders());
        toast("🗑️ Supprimé", false, "orderFormMsg");
      } catch (err) {
        toast("❌ " + (err?.message || "Erreur suppression"), true, "orderFormMsg");
      }
    }
  });

  // --- Toggle thème ---
  const themeToggle = document.getElementById("themeToggle");
  themeToggle?.addEventListener("click", () => {
    const root = document.body;
    const newTheme = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}


// --------- DOM READY ----------
document.addEventListener("DOMContentLoaded", initOrders);
