export const API_BASE = "http://localhost:8000";

const GLOBAL_ROUTES = {
    research: (query) => `${API_BASE}/?route=global.search&query=${encodeURIComponent(query)}`,
};

// Mini toast
export function toast(message, isError = false, targetId = "customerFormMsg") {
  const msg = document.getElementById(targetId);
  if (!msg) return alert(message);
  msg.textContent = message;
  msg.className = "text-sm " + (isError ? "error" : "success");
  setTimeout(() => {
    msg.textContent = "";
    msg.className = "text-sm";
  }, 2500);
}

// --- Global Search robust ---
export async function globalSearch(query) {
  try {
    const res = await fetch(GLOBAL_ROUTES.research(query), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      let msg = "Recherche impossible";
      try {
        const e = await res.json();
        if (e.message || e.error) msg = e.message || e.error;
      } catch {}
      throw new Error(msg);
    }

    const data = await res.json();

    // Toujours renvoyer des tableaux
    return {
      customers: Array.isArray(data.customers) ? data.customers : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      products: Array.isArray(data.products) ? data.products : [],
      orders: Array.isArray(data.orders) ? data.orders : [],
    };
  } catch (e) {
    console.error("Erreur lors de la recherche globale:", e);
    return { customers: [], categories: [], products: [], orders: [] };
  }
}

// --- Render Global Results ---
export function renderGlobalResults(results) {
  const ul = document.getElementById("list");
  ul.innerHTML = "";

  const allItems = [
    ...(results.customers || []).map((item) => ({ ...item, type: "customer", name: item.name, content: item.email })),
    ...(results.categories || []).map((item) => ({ ...item, type: "category", name: item.name, content: "" })),
    ...(results.products || []).map((item) => ({
      ...item,
      type: "product",
      name: item.title,
      content: `SKU: ${item.sku} | Price: ${item.price} € | Stock: ${item.stock}`
    })),
    ...(results.orders || []).map((item) => ({
      ...item,
      type: "order",
      name: `Commande #${item.id}`,
      content: `Statut: ${item.status} | Total: ${item.total} € | Client ID: ${item.customer_id}`
    }))
  ];

  if (!allItems.length) {
    const li = document.createElement("li");
    li.className = "list__empty";
    li.textContent = "Aucun résultat trouvé.";
    ul.appendChild(li);
    return;
  }

  allItems.forEach(item => ul.appendChild(renderGlobalItem(item)));
}

// --- Render single item ---
function renderGlobalItem(item) {
  const li = document.createElement("li");
  li.className = "list__item";
  li.dataset.id = String(item.id || "");

  const typeBadge = document.createElement("span");
  typeBadge.className = "badge " + item.type.toLowerCase();
  typeBadge.textContent = item.type;

  const small = document.createElement("small");
  small.className = "muted";
  const dt = item.created_at ? new Date(item.created_at) : null;
  small.textContent = (dt && !isNaN(dt) ? dt.toLocaleString() : "") + " | ";
  small.prepend(typeBadge);

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = ".5rem";
  actions.style.marginTop = ".25rem";

  if (item.type === "customer") {
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

  if (item.type === "order") {
    const orderInfo = document.createElement("div");
    orderInfo.className = "order-info";

    const idSpan = document.createElement("strong");
    idSpan.textContent = item.name;

    const statusSpan = document.createElement("span");
    statusSpan.className = "badge";
    statusSpan.textContent = item.status;

    const totalSpan = document.createElement("span");
    totalSpan.textContent = `${item.total} €`;

    orderInfo.append(idSpan, statusSpan, totalSpan);
    li.append(orderInfo, small);
    return li;
  }

  const title = document.createElement("strong");
  title.textContent = item.name || "Sans nom";

  const content = document.createElement("p");
  content.textContent = item.content || "";

  li.append(title, content, small, actions);
  return li;
}
