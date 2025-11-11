import { API_BASE, toast, globalSearch, renderGlobalResults } from "./scripts-base.js";

const CUSTOMERS = {
  index: `${API_BASE}/?route=customer.index`,
  create: `${API_BASE}/?route=customer.create`,
  edit: (id) => `${API_BASE}/?route=customer.edit&id=${encodeURIComponent(id)}`,
  delete: (id) =>
    `${API_BASE}/?route=customer.delete&id=${encodeURIComponent(id)}&delete=1`,
};

const customerCache = new Map();

// VARIABLES DE PAGINATION
let customerPage = 1;
const customersPerPage = 2;
let paginatedCustomers = [];


// --------- API calls ----------

async function fetchCustomers() {
  try {
    const res = await fetch(CUSTOMERS.index, {
      headers: { Accept: "application/json" },
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Réponse serveur non JSON :", text);
      throw new Error("Impossible de récupérer les clients.");
    }

    if (!data.success) {
      throw new Error(data.message || "Erreur serveur inconnue");
    }

    // Mettre à jour le cache
    for (const c of data.data || []) {
      customerCache.set(String(c.id), c);
    }

    return data.data || [];
  } catch (err) {
    console.error(err);
    throw new Error("Impossible de récupérer les clients.");
  }
}

async function createCustomer(payload) {
  const body = new URLSearchParams({
    email: (payload.email ?? "").trim(),
    name: (payload.name ?? "").trim(),
  });

  try {
    const res = await fetch(CUSTOMERS.create, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body,
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || e.error || "Erreur POST Customers");
    }

    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function editCustomer(id, payload) {
  const body = new URLSearchParams({
    email: (payload.email ?? "").trim(),
    name: (payload.name ?? "").trim(),
  });

  try {
    const res = await fetch(CUSTOMERS.edit(id), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body,
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || e.error || "Erreur EDIT Customer");
    }

    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function deleteCustomer(id) {
  try {
    const res = await fetch(CUSTOMERS.delete(id), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || e.error || "Erreur DELETE Customers");
    }

    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// --------- Rendu ----------

function renderList(items, containerId = "customer-list") {
  const ul = document.getElementById(containerId);
  ul.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "list__empty";
    li.textContent = containerId === "customer-list" ? "Aucun client." : "Aucun résultat.";
    ul.appendChild(li);
    return;
  }

  paginatedCustomers = items;

  const start = (customerPage - 1) * customersPerPage;
  const end = start + customersPerPage;
  const pageItems = items.slice(start, end);

  for (const it of pageItems) {
    ul.appendChild(renderItem(it));
  }

  renderPagination(items.length);
}

function renderPagination(totalItems) {
  let pagination = document.getElementById("pagination");
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "pagination";
    document.getElementById("customer-list").after(pagination);
  }

  pagination.innerHTML = "";
  const totalPages = Math.ceil(totalItems / customersPerPage);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = i;
    if (i === customerPage) link.classList.add("active");

    link.addEventListener("click", (e) => {
      e.preventDefault();
      customerPage = i;
      renderList(paginatedCustomers);
    });

    pagination.appendChild(link);
  }
}

function renderItem(customer) {
  const li = document.createElement("li");
  li.className = "list__item";
  li.dataset.id = String(customer.id);

  const title = document.createElement("strong");
  title.textContent = customer.name || "(Sans nom)";

  const content = document.createElement("p");
  content.textContent = customer.email || "";

  const small = document.createElement("small");
  small.className = "muted";
  const dt = customer.created_at ? new Date(customer.created_at) : null;
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
  editBtn.dataset.id = String(customer.id);

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "btn btn-ghost";
  delBtn.textContent = "Supprimer";
  delBtn.dataset.action = "delete";
  delBtn.dataset.id = String(customer.id);

  actions.append(editBtn, delBtn);
  li.append(title, content, small, actions);

  return li;
}

// --------- Edit mode ----------

function enterEditMode(li, customer) {
  li.innerHTML = "";

  const form = document.createElement("form");
  form.className = "grid gap-2";

  const emailLabel = document.createElement("label");
  emailLabel.className = "label";
  emailLabel.textContent = "Email";
  const emailInput = document.createElement("input");
  emailInput.className = "input";
  emailInput.value = customer.email || "";
  emailInput.name = "email";
  emailInput.required = true;

  const nameLabel = document.createElement("label");
  nameLabel.className = "label";
  nameLabel.textContent = "Nom";
  const nameInput = document.createElement("input");
  nameInput.className = "input";
  nameInput.value = customer.name || "";
  nameInput.name = "name";
  nameInput.required = true;

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
  form.append(nameLabel, nameInput, emailLabel, emailInput, row);
  li.append(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    cancelBtn.disabled = true;
    try {
      await editCustomer(customer.id, {
        email: emailInput.value.trim(),
        name: nameInput.value.trim(),
      });
      renderList(await fetchCustomers());
      toast("✅ Modifié", false, "customerFormMsg");
    } catch (err) {
      toast("❌ " + (err?.message || "Erreur édition"), true, "customerFormMsg");
    } finally {
      saveBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  });

  cancelBtn.addEventListener("click", () => {
    const fresh = customerCache.get(String(customer.id)) || customer;
    const freshLi = renderItem(fresh);
    li.replaceWith(freshLi);
  });
}

// --------- Boot ----------

export async function initCustomers() {
  const form = document.getElementById("CustomerForm");
  const refreshBtn = document.getElementById("refreshBtn");
  const themeToggle = document.getElementById("themeToggle");
  const listEl = document.getElementById("customer-list");
  const searchBddInput = document.getElementById("research-bdd");

  // Chargement initial
  try {
    renderList(await fetchCustomers());
  } catch (e) {
    console.error(e);
    toast("❌ Erreur au chargement des clients.", true, "customerFormMsg");
  }

  // Création client
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const payload = {
      email: (fd.get("email") || "").trim(),
      name: (fd.get("name") || "").trim(),
    };
    try {
      await createCustomer(payload);
      form.reset();
      renderList(await fetchCustomers());
      toast("✅ Ajouté", false, "customerFormMsg");
    } catch (e) {
      toast("❌ " + e.message, true, "customerFormMsg");
    }
  });

  // Rafraîchir
  refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;
    try {
      renderList(await fetchCustomers());
      toast("✅ Liste Clients rafraîchie", false, "customerFormMsg");
    } catch (e) {
      console.error(e);
      toast("❌ Echec rafraîchissement", true, "customerFormMsg");
    } finally {
      refreshBtn.disabled = false;
    }
  });

  // Actions Éditer / Supprimer (délégation)
  listEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    if (btn.dataset.action === "edit") {
      const li = btn.closest("li");
      const note = customerCache.get(String(id));
      if (!li || !note) return;
      enterEditMode(li, note);
    }

    if (btn.dataset.action === "delete") {
      if (!confirm("Supprimer ce client ?")) return;
      btn.disabled = true;
      try {
        await deleteCustomer(id);
        renderList(await fetchCustomers());
        toast("🗑️ Supprimé", false, "customerFormMsg");
      } catch (err) {
        toast("❌ " + (err?.message || "Erreur suppression"), true, "customerFormMsg");
      } finally {
        btn.disabled = false;
      }
    }
  });

  // Toggle light/dark
  themeToggle.addEventListener("click", () => {
    const root = document.body;
    const current = root.getAttribute("data-theme") || "light";
    root.setAttribute("data-theme", current === "light" ? "dark" : "light");
  });

  // Recherche globale
  searchBddInput.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase().trim();
    try {
      if (query.length > 0) {
        const globalResults = await globalSearch(query);
        renderGlobalResults(globalResults);
      } else {
        renderList(await fetchCustomers());
      }
    } catch (err) {
      console.error(err);
      toast("❌ " + (err?.message || "Erreur de recherche"), true);
    }
  });
}

document.addEventListener("DOMContentLoaded", initCustomers);
