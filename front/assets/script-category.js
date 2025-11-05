import { API_BASE, toast, globalSearch, renderGlobalResults  } from "./scripts-base.js";

const CATEGORIES = {
    index: `${API_BASE}/?route=category.index`,
    create: `${API_BASE}/?route=category.insert`,
    update: (id) => `${API_BASE}/?route=category.update&id=${encodeURIComponent(id)}`,
    delete: (id) => `${API_BASE}/?route=categorie.delete&id=${encodeURIComponent(id)}&delete=1`,
};

const categoryCache = new Map();

//---------------- API calls ------------------------

async function listCategories() {
    const res = await fetch(CATEGORIES.index, {
        headers: { Accept: "application/json" },
    });
    console.log(`Statut de la requête : ${res.status}, ok : ${res.ok}`);
    if (!res.ok) throw new Error("Erreur GET Category");
    const data = await res.json();
    // Controller renvoie un tableau brut
    const rows = Array.isArray(data) ? data : data.data || [];
    // maj cache
    categoryCache.clear();
    for (const n of rows) if (n && n.id != null) categoryCache.set(String(n.id), n);
    return rows;
}

async function insertCategorie(payload) {
    const body = new URLSearchParams({
        name: (payload.name ?? "").toString().trim(),
    });

    const res = await fetch(CATEGORIES.create, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body,
    });

    if (!res.ok) {
    let msg = "Erreur POST Categories";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json(); // {message: "success"}

}

async function editCategorie(id, payload) {
    const body = new URLSearchParams({
    name: (payload.name ?? "").toString().trim(),
  });

  const res = await fetch(CATEGORIES.update(id), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });
  if (!res.ok) {
    let msg = "Erreur UPDATE Categorie";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json(); // {message: "updated"}
}

async function deleteCategorie(id) {
    const res = await fetch(CATEGORIES.delete(id), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    let msg = "Erreur DELETE Categorie";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json(); // {message: "deleted"}
}

function renderList(items) {
    const ul = document.getElementById("category-list")
    ul.innerHTML = "";
    if (!items.length) {
        const li = document.createElement("li");
        li.className = "list__empty";
        li.textContent = "Aucune client.";
        ul.appendChild(li);
        return;
    }
    for (const it of items) {
        const li = renderItem(it);
        ul.appendChild(li);
    }
}

function renderItem(category) {
    const li = document.createElement("li");
    li.className = "list__item";
    li.dataset.id = String(category.id);

    const title = document.createElement("strong");
    title.textContent = category.name || "(Sans titre)";

    const small = document.createElement("small");
    small.className = "muted";
    const dt = category.created_at ? new Date(category.created_at) : null;
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
    editBtn.dataset.id = String(category.id);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-ghost";
    delBtn.textContent = "Supprimer";
    delBtn.dataset.action = "delete";
    delBtn.dataset.id = String(category.id);

    actions.append(editBtn, delBtn);

    li.append(title,small, actions);
    return li;
}

// Passe un <li> en mode édition (inline)
function enterEditMode(li, category) {
  li.innerHTML = ""; // reset

  const form = document.createElement("form");
  form.className = "grid gap-2";

  const nameLabel = document.createElement("label");
  nameLabel.className = "label";
  nameLabel.textContent = "Nom";
  const nameInput = document.createElement("input");
  nameInput.className = "input";
  nameInput.value = category.name || "";
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

  form.append(nameLabel, nameInput, row);
  li.append(form);

  // Submit edit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await editCategorie(category.id, {
        name: nameInput.value.trim(),
      });

      // refresh list
      const items = await listCategories();
      renderList(items);
      toast("✅ Modifié", false, "categoryFormMsg");
    } catch (err) {
      toast("❌ " + (err?.message || "Erreur édition"), true, "categoryFormMsg");
    }
  });

  // Cancel -> re-render item
  cancelBtn.addEventListener("click", () => {
    const fresh = categoryCache.get(String(category.id)) || category;
    const freshLi = renderItem(fresh);
    li.replaceWith(freshLi);
  });
}

// --------- Boot ----------

export async function initCategory() {
  const form = document.getElementById("CategoryForm");
  const refreshBtn = document.getElementById("refreshBtn");
  const themeToggle = document.getElementById("themeToggle");
  const listEl = document.getElementById("category-list");

  try {
    renderList(await listCategories());
  } catch (e) {
    console.error(e);
    toast("x Erreur au chargement des categoriess.", true, "categoryFormMsg");
  }

  // Création
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const payload = {
      name: (fd.get("category") || "").toString().trim(),
    };
    try {
      await insertCategorie(payload);
      form.reset();
      renderList(await listCategories());
      toast("✅ Ajouté", false, "categorieFormMsg");
    } catch (e) {
      toast("❌ " + e.message, true, "categorieFormMsg");
    }
  });

  // Rafraîchir
  refreshBtn.addEventListener("click", async () => {
    try {
      renderList(await listCategories());
      toast ("Liste Categories rafraîchie", false, "categorieFormMsg");
    } catch (e) {
      console.error(e);
      toast("x Echec rafraîchissement", true, "categorieFormMsg")
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
      const note = categoryCache.get(String(id));
      if (!li || !note) return;
      enterEditMode(li, note);
    }

    if (btn.dataset.action === "delete") {
      if (!confirm("Supprimer cette categorie ?")) return;
      try {
        await deleteCategorie(id);
        renderList(await listCategories());
        toast("🗑️ Supprimé", false, "categorieFormMsg");
      } catch (err) {
        toast("❌ " + (err?.message || "Erreur suppression"), true, "categorieFormMsg");
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
        renderGlobalResults({ customers: [], categories: [], products: [], orders: [] });
      }
    } catch (e) {
      console.error(e);
      toast("x " + (e.message || "Erreur de recherche"), true);
    }
  });
}



