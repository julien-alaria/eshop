import { API_BASE, toast, globalSearch, renderGlobalResults } from "./scripts-base.js";

const PRODUCTS = {
  indexProduct: `${API_BASE}/?route=product.index`,
  createProduct: `${API_BASE}/?route=product.create`,
  editProduct: (id) => `${API_BASE}/?route=product.edit&id=${encodeURIComponent(id)}`,
  deleteProduct: (id) => `${API_BASE}/?route=product.delete&id=${encodeURIComponent(id)}&delete=1`,
};

const CATEGORIES_ROUTE = `${API_BASE}/?route=category.index`;

const productCache = new Map();
const categoryCache = new Map();

// ---------- API ----------

async function fetchProducts() {
  try {
    const res = await fetch(PRODUCTS.indexProduct, { headers: { Accept: "application/json" } });
    const text = await res.text();
    console.log("Réponse brute du serveur :", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      toast("❌ Erreur chargement Produits/Catégories", true);
      return [];
    }

    // Mettre à jour le cache
    productCache.clear();
    const rows = Array.isArray(data) ? data : data.data || [];
    for (const p of rows) if (p?.id != null) productCache.set(String(p.id), p);

    return rows;
  } catch (err) {
    toast("❌ Erreur chargement Produits/Catégories", true);
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(CATEGORIES_ROUTE, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Erreur GET Catégories");
    const data = await res.json();
    const rows = Array.isArray(data) ? data : data.data || [];
    categoryCache.clear();
    for (const c of rows) if (c?.id != null) categoryCache.set(String(c.id), c);
    return rows;
  } catch (err) {
    toast("❌ Impossible de charger les catégories", true);
    console.error(err);
    return [];
  }
}


async function createProduct(payload) {
  const body = new URLSearchParams({
    sku: (payload.sku ?? "").trim(),
    title: (payload.title ?? "").trim(),
    price: (payload.price ?? "").trim(),
    stock: (payload.stock ?? "").trim(),
    category_id: (payload.category_id ?? "").trim(),
  });
  const res = await fetch(PRODUCTS.createProduct, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });
  if (!res.ok) {
    let msg = "Erreur création";
    try { const e = await res.json(); msg = e.message || e.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function editProduct(id, payload) {
  const body = new URLSearchParams({
    sku: (payload.sku ?? "").trim(),
    title: (payload.title ?? "").trim(),
    price: (payload.price ?? "").trim(),
    stock: (payload.stock ?? "").trim(),
    category_id: (payload.category_id ?? "").trim(),
  });
  const res = await fetch(PRODUCTS.editProduct(id), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });
  if (!res.ok) {
    let msg = "Erreur édition";
    try { const e = await res.json(); msg = e.message || e.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function deleteProduct(id) {
  const res = await fetch(PRODUCTS.deleteProduct(id), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    let msg = "Erreur suppression";
    try { const e = await res.json(); msg = e.message || e.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ---------- UI ----------

function populateCategorySelect(selectEl) {
  selectEl.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- Choisir une catégorie --";
  selectEl.appendChild(defaultOption);
  for (const [id, cat] of categoryCache.entries()) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = cat.name;
    selectEl.appendChild(opt);
  }
}

function renderList(items) {
  const ul = document.getElementById("product-list");
  ul.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "list__empty";
    li.textContent = "Aucun produit.";
    ul.appendChild(li);
    return;
  }
  for (const p of items) ul.appendChild(renderItem(p));
}

function renderItem(product) {
  const li = document.createElement("li");
  li.className = "list__item";
  li.dataset.id = product.id;

  const title = document.createElement("strong");
  title.textContent = product.sku || "(Sans SKU)";

  const content = document.createElement("p");
  content.textContent = product.title || "";

  const category = document.createElement("small");
  category.className = "muted";
  category.textContent = product.category || "";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = ".5rem";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn-ghost";
  editBtn.textContent = "Éditer";
  editBtn.dataset.action = "edit";
  editBtn.dataset.id = product.id;

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "btn btn-ghost";
  delBtn.textContent = "Supprimer";
  delBtn.dataset.action = "delete";
  delBtn.dataset.id = product.id;

  actions.append(editBtn, delBtn);
  li.append(title, content, category, actions);
  return li;
}

// Inline editing
function enterEditMode(li, product) {
  li.innerHTML = "";
  const form = document.createElement("form");
  form.className = "grid gap-2";

  const skuInput = document.createElement("input");
  skuInput.value = product.sku || "";
  skuInput.name = "sku";
  skuInput.required = true;
  skuInput.className = "input";

  const titleInput = document.createElement("input");
  titleInput.value = product.title || "";
  titleInput.name = "title";
  titleInput.required = true;
  titleInput.className = "input";

  const priceInput = document.createElement("input");
  priceInput.type = "number";
  priceInput.value = product.price || "";
  priceInput.name = "price";
  priceInput.required = true;
  priceInput.className = "input";

  const stockInput = document.createElement("input");
  stockInput.type = "number";
  stockInput.value = product.stock || "";
  stockInput.name = "stock";
  stockInput.required = true;
  stockInput.className = "input";

  const categorySelect = document.createElement("select");
  categorySelect.name = "category_id";
  categorySelect.className = "input";
  populateCategorySelect(categorySelect);
  categorySelect.value = product.category_id || "";

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = ".5rem";

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.className = "btn";
  saveBtn.textContent = "Enregistrer";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn btn-ghost";
  cancelBtn.textContent = "Annuler";

  row.append(saveBtn, cancelBtn);
  form.append(skuInput, titleInput, priceInput, stockInput, categorySelect, row);
  li.append(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await editProduct(product.id, {
        sku: skuInput.value,
        title: titleInput.value,
        price: priceInput.value,
        stock: stockInput.value,
        category_id: categorySelect.value,
      });
      renderList(await fetchProducts());
      toast("✅ Produit modifié");
    } catch (err) {
      toast("❌ " + (err.message || "Erreur édition"), true);
    }
  });

  cancelBtn.addEventListener("click", () => {
    const fresh = productCache.get(String(product.id)) || product;
    li.replaceWith(renderItem(fresh));
  });
}

// ---------- Init ----------

export async function initProducts() {
  const form = document.getElementById("ProductForm");
  const refreshBtn = document.getElementById("refreshProductBtn");
  const listEl = document.getElementById("product-list");
  const categorySelect = document.getElementById("product-category-select");

  try {
    await fetchCategories();
    populateCategorySelect(categorySelect);
    renderList(await fetchProducts());
  } catch (e) {
    console.error(e);
    toast("❌ Erreur chargement Produits/Catégories", true);
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    try {
      await createProduct({
        sku: fd.get("sku")?.toString().trim(),
        title: fd.get("title")?.toString().trim(),
        price: fd.get("price")?.toString().trim(),
        stock: fd.get("stock")?.toString().trim(),
        category_id: fd.get("category_id")?.toString().trim() || null,
      });
      form.reset();
      renderList(await fetchProducts());
      toast("✅ Produit ajouté");
    } catch (err) {
      toast("❌ " + (err.message || "Erreur création"), true);
    }
  });

  refreshBtn.addEventListener("click", async () => {
    try {
      await fetchCategories();
      populateCategorySelect(categorySelect);
      renderList(await fetchProducts());
      toast("Liste Produits rafraîchie");
    } catch (e) {
      console.error(e);
      toast("❌ Échec rafraîchissement Produits", true);
    }
  });

  // Delegation: Edit/Delete
  listEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    if (btn.dataset.action === "edit") {
      const li = btn.closest("li");
      const product = productCache.get(String(id));
      if (!li || !product) return;
      enterEditMode(li, product);
    }

    if (btn.dataset.action === "delete") {
      if (!confirm("Supprimer ce produit ?")) return;
      try {
        await deleteProduct(id);
        renderList(await fetchProducts());
        toast("🗑️ Produit supprimé");
      } catch (err) {
        toast("❌ " + (err.message || "Erreur suppression"), true);
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", initProducts);
