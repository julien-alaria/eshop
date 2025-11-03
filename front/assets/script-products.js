import { API_BASE, toast } from "./scripts-base.js";

const PRODUCTS = {
  indexProduct: `${API_BASE}/?route=product.index`,
  createProduct: `${API_BASE}/?route=product.create`,
  editProduct: (id) => `${API_BASE}/?route=product.edit&id=${encodeURIComponent(id)}`,
  deleteProduct: (id) => `${API_BASE}/?route=product.delete&id=${encodeURIComponent(id)}&delete=1}`,
};

const CATEGORIES_ROUTE = `${API_BASE}/?route=category.index`;

const productCache = new Map();
const categoryCache = new Map();

// --------- API calls ----------

async function fetchProducts() {
  const res = await fetch(PRODUCTS.indexProduct, {
    header: { Accept: "application/json"},
  });
  console.log(`Statut de la requête : ${res.status}, ok : ${res}`);
  if (!res.ok) throw new Error("Erreur GET");
  const data = await res.json();

  const rows = Array.isArray(data) ? data : data.data || [];
  productCache.clear();
  for (const n of rows) if (n && n.id != null) productCache.set(String(n.id), n);
  return rows;
}

async function createProducts(payload) {
    // Le controller lit $_POST[] et $_POST[] -> form-urlencoded
    const body = new URLSearchParams ({
        sku: (payload.sku ?? "").toString().trim(),
        title: (payload.title ?? "").toString().trim(),
        price: (payload.price ?? "").toString().trim(),
        stock: (payload.stock ?? "").toString().trim(),
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
        let msg = "Erreur POST";
        try {
            const e = await res.json();
            if (e.message || e.error) msg = e.message || e.error;
        } catch {}
        throw new Error(msg);
    }
    return res.json(); 
}

async function editProduct(id, payload) {
  const body = new URLSearchParams({
    sku: (payload.sku ?? "").toString().trim(),
    title: (payload.title ?? "").toString().trim(),
    price: (payload.price ?? "").toString().trim(),
    stock: (payload.stock ?? "").toString().trim(),
    // categorie_id: (categorie_id.stock ?? "").toString().trim(),
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
    let msg = "Erreur EDIT";
    try {
      const e = await res.json();
      if (e.message || e.error) msg = e.message || e.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json(); // {message: "updated"}
}

async function deleteProduct(id) {
  // Le controller supprime si $_GET['delete'] est présent -> GET suffit
  const res = await fetch(PRODUCTS.deleteProduct(id), {
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

async function fetchCategories() {
  const res = await fetch(CATEGORIES_ROUTE, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Erreur GET Categories");
  const data = await res.json();
  const rows = Array.isArray(data) ? data : data.data || [];

  // Mise à jour du cache
  categoryCache.clear();
  for (const c of rows) if (c && c.id != null) categoryCache.set(String(c.id), c);
  return rows;
}

function populateCategorySelect(selectElement) {
    selectElement.innerHTML = '';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Choisir une catégorie --';
    selectElement.appendChild(defaultOption);

    for (const [id, cat] of categoryCache.entries()) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = cat.name;
        selectElement.appendChild(option);
    }
}

// --------- UI rendering ----------

function renderList(items) {
  const ul = document.getElementById("product-list");
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

function renderItem(product) {
  const li = document.createElement("li");
  li.className = "list__item";
  li.dataset.id = String(product.id);

  const title = document.createElement("strong");
  title.textContent = product.sku || "(Sans titre)";

  const content = document.createElement("p");
  content.textContent = product.title || "";

  const small = document.createElement("small");
  small.className = "muted";
  const dt = product.created_at ? new Date(product.created_at) : null;
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
  editBtn.dataset.id = String(product.id);

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "btn btn-ghost";
  delBtn.textContent = "Supprimer";
  delBtn.dataset.action = "delete";
  delBtn.dataset.id = String(product.id);

  actions.append(editBtn, delBtn);

  li.append(title, content, small, actions);
  return li;
}

// Passe un <li> en mode édition (inline)
function enterEditMode(li, product) {
  li.innerHTML = ""; // reset

  const form = document.createElement("form");
  form.className = "grid gap-2";

  const skuLabel = document.createElement("label");
  skuLabel.className = "label";
  skuLabel.textContent = "Sku";
  const skuInput = document.createElement("input");
  skuInput.className = "input";
  skuInput.value = product.title || "";
  skuInput.name = "sku";
  skuInput.required = true;

  const titleLabel = document.createElement("label");
  titleLabel.className = "label";
  titleLabel.textContent = "Nom";
  const titleInput = document.createElement("input");
  titleInput.className = "input";
  titleInput.value = product.title || "";
  titleInput.name = "title";
  titleInput.required = true;

  const priceLabel = document.createElement("label");
  priceLabel.className = "label";
  priceLabel.textContent = "Prix";
  const priceInput = document.createElement("input");
  priceInput.className = "input";
  priceInput.type = "number";
  priceInput.value = product.price || "";
  priceInput.name = "price";
  priceInput.required = true;

  const stockLabel = document.createElement("label");
  stockLabel.className = "label";
  stockLabel.textContent = "Stock";
  const stockInput = document.createElement("input");
  stockInput.className = "input";
  stockInput.type = "number";
  stockInput.value = product.stock || "";
  stockInput.name = "stock";
  stockInput.required = true;

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

  form.append(skuLabel, skuInput, titleLabel, titleInput, priceLabel,priceInput, stockLabel, stockInput, row);
  li.append(form);

  // Submit edit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await editProduct(product.id, {
        sku: skuInput.value.trim(),
        title: titleInput.value.trim(),
        price: priceInput.value.trim(),
        stock: stockInput.value.trim(),
      });
      // refresh list
      const items = await fetchProducts();
      renderList(items);
      toast("✅ Modifié");
    } catch (err) {
      toast("❌ " + (err?.message || "Erreur édition"), true);
    }
  });

  // Cancel -> re-render item
  cancelBtn.addEventListener("click", () => {
    const fresh = productCache.get(String(product.id)) || product;
    const freshLi = renderItem(fresh);
    li.replaceWith(freshLi);
  });
}

// --------- Boot ----------

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
    toast("❌ Erreur au chargement (Produits/Catégories).", true, "productFormMsg");
  }

  // Création
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const payload = {
      sku: (fd.get("sku") || "").toString().trim(),
      title: (fd.get("title") || "").toString().trim(),
      price: (fd.get("price") || "").toString().trim(),
      stock: (fd.get("stock") || "").toString().trim(),
    };
    try {
      await createProducts(payload);
      form.reset();
      renderList(await fetchProducts());
      toast("✅ Produit ajouté", false, "productFormMsg");
    } catch (e) {
      toast("❌ " + e.message, true, "productFormMsg");
    }
  });

  // Rafraîchir
  refreshBtn.addEventListener("click", async () => {
    try {
      await fetchCategories(); 
      populateCategorySelect(categorySelect); 
      renderList(await fetchProducts());
      toast("Liste Produits rafraîchie", false, "productFormMsg");
    } catch (e) {
      console.error(e);
      toast("❌ Échec rafraîchissement Produits", true, "productFormMsg")
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
      const product = productCache.get(String(id));
      if (!li || !product) return;
      enterEditMode(li, product);
    }

    if (btn.dataset.action === "delete") {
      if (!confirm("Supprimer cet Produit ?")) return;
      try {
        await deleteProduct(id);
        renderList(await fetchProducts());
        toast("🗑️ Produit supprimé", false, "productFormMsg");
      } catch (err) {
        toast("❌ " + (err?.message || "Erreur suppression"), true, "productFormMsg");
      }
    }
  });
}

