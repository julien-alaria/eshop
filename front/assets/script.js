// URL du back (adaptez si besoin)
const API_BASE = "http://localhost:8000";

// Routes attendues par ton router PHP (?route=notes.*)
const ROUTES = {
  index: `${API_BASE}/?route=customer.index`,
  create: `${API_BASE}/?route=customer.create`,
  edit: (id) => `${API_BASE}/?route=customer.edit&id=${encodeURIComponent(id)}`,
  delete: (id) =>
    `${API_BASE}/?route=customer.delete&id=${encodeURIComponent(id)}&delete=1`,
  research: (query) =>
    `${API_BASE}/?route=customer.research&query=${encodeURIComponent(query)}`,
};

// Petit cache local pour retrouver vite une note par id
const noteCache = new Map();

// --------- API calls ----------

async function fetchCustomers() {
  const res = await fetch(ROUTES.index, {
    headers: { Accept: "application/json" },
  });
  console.log(`Statut de la requête : ${res.status}, ok : ${res.ok}`);
  if (!res.ok) throw new Error("Erreur GET");
  const data = await res.json();
  // Controller renvoie un tableau brut
  const rows = Array.isArray(data) ? data : data.data || [];
  // maj cache
  noteCache.clear();
  for (const n of rows) if (n && n.id != null) noteCache.set(String(n.id), n);
  return rows;
}

async function createCustomer(payload) {
  // Le controller lit $_POST['title'] et $_POST['content'] -> form-urlencoded
  const body = new URLSearchParams({
    email: (payload.email ?? "").toString().trim(),
    name: (payload.name ?? "").toString().trim(),
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
    let msg = "Erreur POST";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json(); // {message: "success"}
}

async function editCustomer(id, payload) {
  const body = new URLSearchParams({
    email: (payload.email ?? "").toString().trim(),
    name: (payload.name ?? "").toString().trim(),
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
    let msg = "Erreur EDIT";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json(); // {message: "updated"}
}

async function deleteCustomer(id) {
  // Le controller supprime si $_GET['delete'] est présent -> GET suffit
  const res = await fetch(ROUTES.delete(id), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    let msg = "Erreur DELETE";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json(); // {message: "deleted"}
}

async function globalSearch(query) {
  const res = await fetch(ROUTES.research(query), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    let msg = "Recherche Impossible";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }

  const rawText = await res.text();
  console.log("Réponse brute du serveur:", rawText);

  if (rawText === "null" || rawText.trim() === "") {
    return { customers: [], categories: [], products: [] };
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    console.error("Erreur de parsing JSON:", e);
    throw new Error("Réponse serveur illisible ou vide.");
  }
  return typeof data === "object" && data !== null
    ? data
    : { customers: [], categories: [], products: [] };
}

// --------- UI rendering ----------

function renderList(items) {
  const ul = document.getElementById("list");
  ul.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "list__empty";
    li.textContent = "Aucune note.";
    ul.appendChild(li);
    return;
  }
  for (const it of items) {
    const li = renderItem(it);
    ul.appendChild(li);
  }
}

function renderItem(customer) {
  const li = document.createElement("li");
  li.className = "list__item";
  li.dataset.id = String(customer.id);

  const title = document.createElement("strong");
  title.textContent = customer.name || "(Sans titre)";

  const content = document.createElement("p");
  content.textContent = customer.email || "";

  const small = document.createElement("small");
  small.className = "muted";
  const dt = customer.created_at ? new Date(customer.created_at) : null;
  small.textContent = dt && !isNaN(dt) ? dt.toLocaleString() : "";

  // Actions: Éditer / Supprimer
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

// Passe un <li> en mode édition (inline)
function enterEditMode(li, customer) {
  li.innerHTML = ""; // reset

  const form = document.createElement("form");
  form.className = "grid gap-2";

  const emailLabel = document.createElement("label");
  emailLabel.className = "label";
  emailLabel.textContent = "Email";
  const emailInput = document.createElement("input");
  emailInput.className = "input";
  emailInput.value = customer.email || "";
  emailInput.email = "email";
  emailInput.required = true;

  const nameLabel = document.createElement("label");
  nameLabel.className = "label";
  nameLabel.textContent = "name";
  const nameInput = document.createElement("input");
  nameInput.className = "input";
  nameInput.rows = 4;
  nameInput.value = customer.name || "";
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

  // Submit edit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await editCustomer(customer.id, {
        email: emailInput.value.trim(),
        name: nameInput.value.trim(),
      });
      // refresh list
      const items = await fetchCustomers();
      renderList(items);
      toast("✅ Modifié");
    } catch (err) {
      toast("❌ " + (err?.message || "Erreur édition"), true);
    }
  });

  // Cancel -> re-render item
  cancelBtn.addEventListener("click", () => {
    const fresh = customerCache.get(String(note.id)) || note;
    const freshLi = renderItem(fresh);
    li.replaceWith(freshLi);
  });
}

function renderGlobalResults(results) {
  const ul = document.getElementById("list");
  ul.innerHTML = "";

  // Consolidation des tous les tableaux en un seul
  const allItems = [
    ...(results.customers || []).map((item) => ({ ...item, type: "customer" })),
    ...(results.categories || []).map(item => ({...item, type: 'categorie'})),
    ...(results.products || []).map(item => ({...item, type: 'product', name: item.title, content: `sku: ${item.sku} | price: ${item.price}`})),
  ];

  if (!allItems.length) {
    const li = document.createElement("li");
    li.className = "list__empty";
    li.textContent = "Aucun résultat trouvé.";
    ul.appendChild(li);
    return;
  }

  for (const it of allItems) {
    const li = renderGlobalItem(it);
    ul.appendChild(li);
  }
}

function renderGlobalItem(item) {
  const li = document.createElement("li");
  li.className = "list__item";
  li.dataset.id = String(item.id);

  // Titre: Nom de l'entité
  const title = document.createElement("strong");
  title.textContent = item.name || item.title || ("Sans nom");

  // Contenu: Informations spécifiques ou description
  const content = document.createElement("p");
  content.textContent = item.content || item.email || "";

  // Type: Indication de l'entité (client, catégorie, produit)
  const typeBadge = document.createElement("span");
  typeBadge.className = "badge " + item.type.toLowerCase().replace('é', 'e');
  typeBadge.textContent = item.type;

  const small = document.createElement("small");
  small.className = "muted";
  const dt = item.created_at ? new Date(item.created_at) : null;
  small.textContent = (dt && !isNaN(dt) ? dt.toLocaleString() : "") + " | ";

  // Les actions d'édition/suppression doivent être désactivées pour les catégories/produits
  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = ".5rem";
  actions.style.marginTop = ".25rem";

  // Afficher uniquement les actions du CRUD si c'est un client
  if (item.type === 'customer') {
    // Actions: Éditer / Supprimer
    const edit = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = ".5rem";
    actions.style.marginTop = ".25rem";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-ghost";
    editBtn.textContent = "Éditer";
    editBtn.dataset.action = "edit";
    editBtn.dataset.id = String(item.id);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-ghost";
    delBtn.textContent = "Supprimer";
    delBtn.dataset.action = "delete";
    delBtn.dataset.id = String(item.id);

    actions.append(editBtn, delBtn);
  }

  small.prepend(typeBadge);

  li.append(title, content, small, actions);
  return li;

}


// Mini toast (utilise #formMsg existant si présent)
function toast(message, isError = false) {
  const msg = document.getElementById("formMsg");
  if (!msg) return alert(message);
  msg.textContent = message;
  msg.className = "text-sm " + (isError ? "error" : "success");
  // efface après 2,5s
  setTimeout(() => {
    msg.textContent = "";
    msg.className = "text-sm";
  }, 2500);
}

// --------- Boot ----------

async function init() {
  const form = document.getElementById("CustomerForm");
  const refreshBtn = document.getElementById("refreshBtn");
  const themeToggle = document.getElementById("themeToggle");
  const listEl = document.getElementById("list");

  try {
    renderList(await fetchCustomers());
  } catch (e) {
    console.error(e);
  }

  // Création
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const payload = {
      email: (fd.get("email") || "").toString().trim(),
      name: (fd.get("name") || "").toString().trim(),
    };
    try {
      await createCustomer(payload);
      form.reset();
      renderList(await fetchCustomers());
      toast("✅ Ajouté");
    } catch (e) {
      toast("❌ " + e.message, true);
    }
  });

  // Rafraîchir
  refreshBtn.addEventListener("click", async () => {
    try {
      renderList(await fetchCustomers());
    } catch (e) {
      console.error(e);
    }
  });

  // Délégation des actions Éditer / Supprimer
  listEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    if (btn.dataset.action === "edit") {
      const li = btn.closest("li");
      const note = noteCache.get(String(id));
      if (!li || !note) return;
      enterEditMode(li, note);
    }

    if (btn.dataset.action === "delete") {
      if (!confirm("Supprimer cette note ?")) return;
      try {
        await deleteCustomer(id);
        renderList(await fetchCustomers());
        toast("🗑️ Supprimé");
      } catch (err) {
        toast("❌ " + (err?.message || "Erreur suppression"), true);
      }
    }
  });

  // Toggle light/dark + animation
  themeToggle.addEventListener("click", () => {
    const root = document.body;
    const current = root.getAttribute("data-theme") || "light";
    root.setAttribute("data-theme", current === "light" ? "dark" : "light");
  });

  const searchBddInput = document.getElementById("research-bdd");
  searchBddInput.addEventListener("input", async function (e) {
    const query = e.target.value.toLowerCase();
    console.log(query);

    try {
      if (query.length > 0) {
        const globalResults = await globalSearch(query);

        renderGlobalResults(globalResults);
      } else {
        renderList(await fetchCustomers());
      }
    } catch (e) {
      console.error(e);
      toast("x " + (e.message || "Erreur de recherche"), true);
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
