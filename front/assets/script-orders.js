import { API_BASE, toast, globalSearch, renderGlobalResults } from "./scripts-base.js";

const ROUTES = {
  index: `${API_BASE}/?route=orders.list`,
  create: `${API_BASE}/?route=orders.create`,
  edit: (id) => `${API_BASE}/?route=orders.edit&id=${encodeURIComponent(id)}`,
  delete: (id) => `${API_BASE}/?route=orders.delete&id=${encodeURIComponent(id)}`,
  export: `${API_BASE}/?route=orders.export`,
  show: (id) => `${API_BASE}/?route=orders.show&id=${encodeURIComponent(id)}`,
  customers: `${API_BASE}/?route=customer.index`,
};

const orderCache = new Map();
const validStatuses = ["pending", "paid", "refunded", "cancelled"];

// --------- UTILITAIRES ----------

//Crée un input avec label

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
  for (const n of rows) if (n && n.id != null) orderCache.set(String(n.id), n);
  return rows;
}

//Crée une nouvelle commande.
async function createOrder(payload) {
  // Conversion des types pour correspondre à la table SQLite
  const body = new URLSearchParams({
    customer_id: Number(payload.customer_id) || 0, // INTEGER
    status: (payload.status || "pending").toString(), // TEXT
    total: Number(payload.total) || 0, // REAL
  });

  const res = await fetch(ROUTES.create, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });

  if (!res.ok) {
    let msg = "Erreur POST Order";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

//Modifie une commande existante.
async function editOrder(id, payload) {
  // Conversion des types pour correspondre à la table SQLite
  const body = new URLSearchParams({
    customer_id: Number(payload.customer_id) || 0, // INTEGER
    status: (payload.status || "pending").toString(), // TEXT
    total: Number(payload.total) || 0, // REAL
  });

  const res = await fetch(ROUTES.edit(id), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });

  if (!res.ok) {
    let msg = "Erreur EDIT Order";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
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

// --------- RENDU ----------

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
  for (const order of items) ul.appendChild(renderItem(order));
}

export function renderItem(order) {
  const li = document.createElement("li");
  li.className = "list__item";
  li.dataset.id = String(order.id);

  const title = document.createElement("strong");
  title.textContent = `Commande #${order.id} | Total: ${order.total ? order.total.toFixed(2) : "N/A"}€`;

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

export function enterEditMode(li, order) {
  li.innerHTML = "";
  const form = document.createElement("form");
  form.className = "grid gap-2";

  const customerIdInput = createInput("ID Client", "customer_id", "number", order.customer_id);
  const totalInput = createInput("Total (€)", "total", "number", order.total, "0.01");

  const statusLabel = document.createElement("label");
  statusLabel.className = "label";
  statusLabel.textContent = "Statut";

  const statusSelect = document.createElement("select");
  statusSelect.className = "input";
  statusSelect.name = "status";
  statusSelect.required = true;

  let currentStatus = validStatuses.includes(String(order.status)) ? String(order.status) : "pending";
  for (const s of validStatuses) {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s.charAt(0).toUpperCase() + s.slice(1);
    if (currentStatus === s) opt.selected = true;
    statusSelect.appendChild(opt);
  }

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

  form.append(
    customerIdInput.label, customerIdInput.input,
    statusLabel, statusSelect,
    totalInput.label, totalInput.input,
    row
  );
  li.append(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await editOrder(order.id, {
        customer_id: customerIdInput.input.value.trim(),
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
    const fresh = orderCache.get(String(order.id)) || order;
    li.replaceWith(renderItem(fresh));
  });
}

// --------- INIT ----------

export async function initOrders() {
  const form = document.getElementById("OrderForm");
  const refreshBtn = document.getElementById("refreshOrderBtn");
  const themeToggle = document.getElementById("themeToggle");
  const listEl = document.getElementById("order-list");
  const searchBddInput = document.getElementById("research-bdd");

  try { renderList(await fetchOrders()); } 
  catch (e) { console.error(e); toast("x Erreur au chargement des commandes.", true, "orderFormMsg"); }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const payload = {
      customer_id: (fd.get("customer_id") || "").toString().trim(),
      status: (fd.get("status") || "").toString().trim(),
      total: (fd.get("total") || "").toString().trim(),
    };
    try {
      await createOrder(payload);
      form.reset();
      renderList(await fetchOrders());
      toast("✅ Commande ajoutée", false, "orderFormMsg");
    } catch (e) {
      toast("❌ " + e.message, true, "orderFormMsg");
    }
  });

  refreshBtn.addEventListener("click", async () => {
    try {
      renderList(await fetchOrders());
      toast("Liste Commandes rafraîchie", false, "orderFormMsg");
    } catch (e) {
      console.error(e);
      toast("x Echec rafraîchissement", true, "orderFormMsg");
    }
  });

  listEl.addEventListener("click", async (e) => {
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

  themeToggle.addEventListener("click", () => {
    const root = document.body;
    root.setAttribute("data-theme", root.getAttribute("data-theme") === "light" ? "dark" : "light");
  });

  searchBddInput.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    try {
      if (query.length > 0) {
        renderGlobalResults(await globalSearch(query));
      } else {
        renderList(await fetchOrders());
      }
    } catch (e) {
      console.error(e);
      toast("x " + (e.message || "Erreur de recherche"), true);
    }
  });
}

document.addEventListener("DOMContentLoaded", initOrders);
