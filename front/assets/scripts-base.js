export const API_BASE = "http://localhost:8000";

const GLOBAL_ROUTES = {
    research: (query) => `${API_BASE}/?route=global.search&query=${encodeURIComponent(query)}`,
};

// / Mini toast (utilise #formMsg existant si présent)
export function toast(message, isError = false, targetId = "customerFormMsg") {
  const msg = document.getElementById(targetId);
  if (!msg) return alert(message);
  msg.textContent = message;
  msg.className = "text-sm " + (isError ? "error" : "success");
  // efface après 2,5s
  setTimeout(() => {
    msg.textContent = "";
    msg.className = "text-sm";
  }, 2500);
}

export async function globalSearch(query) {
  const res = await fetch(GLOBAL_ROUTES.research(query), {
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
    return { customers: [], categories: [], products: [], orders: [] };
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

export function renderGlobalResults(results) {
  const ul = document.getElementById("list");
  ul.innerHTML = "";

  // Consolidation des tous les tableaux en un seul
  const allItems = [
    ...(results.customers || []).map((item) => ({ ...item, type: "customer" })),
    ...(results.categories || []).map(item => ({...item, type: 'categorie'})),
    ...(results.products || []).map(item => ({...item, type: 'product', name: item.title, content: `sku: ${item.sku} | price: ${item.price}`})),
    ...(results.orders || []).map(item => ({...item, type: "orders", name: `"Commande#${item.id}`, content : `Statut : ${item.status} | Total : ${item.total} € | ID Client : ${item.customer_id}`})),
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

  // SI c'est une ORDER
  if (item.type === 'orders') {
    const orderContent = document.createElement("strong");
    orderContent.textContent = item.id;

    const totalOrder = document.createElement("p");
    totalOrder.textContent = item.total;

    const orderStatus = document.createElement("span");
    totalOrder.textContent = item.status;
  }

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
