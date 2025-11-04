import { API_BASE, toast } from "./scripts-base.js";

const STATS_ROUTE = { 
  index_stats: `${API_BASE}/?route=stats.kpis` ,
  revenue_chart: `${API_BASE}/?route=stats.revenue`,
  average_order: `${API_BASE}/?route=stats.average`,
  average_daily: `${API_BASE}/?route=stats.daily`,
  top_product:`${API_BASE}/?route=stats.topproduct`,
  order_status: `${API_BASE}/?route=stats.status`,
};

const statsCache = new Map();

//----------------------Actions---------------------------

async function fetchStats() {
  const res = await fetch(STATS_ROUTE.index_stats, {
    headers: { Accept: "application/json" },
  });
  console.log(`Statut de la requête : ${res.status}, ok : ${res}`);
  if (!res.ok) throw new Error("Erreur GET");
  const data = await res.json();

  statsCache.clear();
  statsCache.set("kpis", data);

  return data;
}

// --------- UI rendering ----------

async function renderKpis(kpis) {
  if (!kpis || typeof kpis.totalRevenue === "undefined") {
    const statsDisplay = document.getElementById("stats-kpis-display");
    statsDisplay.innerHTML = "<h3>Aucune Donnée Disponible</h3>";
    return;
  }

  const revenueEl = document.getElementById("totalRevenueDisplay");
  revenueEl.textContent = kpis.totalRevenue.toFixed(2) + "€";
  //to fixed pour arrondir au centimes

  const orderEl = document.getElementById("orderCountDisplay");
  orderEl.textContent = kpis.orderCount;

  const averageEl = document.getElementById("averageOrderValueDisplay");
  averageEl.textContent = kpis.averageOrderValue.toFixed(2) + " €";

  const topProductEl = document.getElementById("topProductDisplay");
  if (kpis.topProduct && kpis.topProduct.length > 0) {
    const topItem = kpis.topProduct[0];
    topProductEl.textContent = `${topItem.title} (${topItem.total_sold} vendus)`;
  } else {
    topProductEl.textContent = "N/A";
  }
}

async function renderRevenue() {
  const res = await fetch(STATS_ROUTE.revenue_chart);
  const { labels, values } = await res.json();
  new Chart(document.getElementById('chartRevenue'), {
    type: 'line',
    data: { labels, datasets: [{ label: 'CA (€/jour', data: values }]
  }});
}

async function renderStatus() {
  const res = await fetch(STATS_ROUTE.order_status);
  const { orders_by_status } = await res.json();
  const labels = Object.keys(orders_by_status);
  const values = Object.values(orders_by_status);
  new Chart(document.getElementById('chartStatus'), {
    type: 'doughnut',
    data: { labels, datasets: [{ label: 'Commandes', data: values}]}
  });
}

async function renderTop() {
  const res = await fetch(STATS_ROUTE.top_product);
  const { top_products } = await res.json();
  const labels = top_products.map(x => x.title);
  const values = top_products.map(x => x.qty);
  new Chart(document.getElementById('chartTop'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Quantités', data: values}]}
  });
}

// --------- Boot ----------

export async function initStats() {
  const refreshBtn = document.getElementById("refreshProductBtn");
  const listEl = document.getElementById("stats-list");

  try {
    await renderKpis(await fetchStats());
    await renderRevenue();
    await renderTop();
    await renderStatus();
  } catch (e) {
    console.error(e);
    toast("❌ Erreur au chargement Liste Statistiques", true);
  }

  // Rafraîchir
  const refreshstatBtn = document.querySelector("#refreshStatBtn");
  refreshstatBtn.addEventListener("click", async () => {
    try {
      await renderKpis(await fetchStats());
      await renderRevenue();
      await renderTop();
      await renderStatus();
      toast("Liste Statistiques rafraîchie", false);
    } catch (e) {
      console.error(e);
      toast("❌ Échec rafraîchissement Liste Statistiques");
    }
  });
}
