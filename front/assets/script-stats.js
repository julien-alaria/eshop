import { API_BASE, toast } from "./scripts-base.js";

const STATS_ROUTE = {index_stats: `${API_BASE}/?route=stats.kpis`};

const statsCache = new Map();

//----------------------Actions---------------------------

async function fetchStats() {
  const res = await fetch(STATS_ROUTE.index_stats, {
    headers: { Accept: "application/json"},
  });
  console.log(`Statut de la requête : ${res.status}, ok : ${res}`);
  if (!res.ok) throw new Error("Erreur GET");
  const data = await res.json();

  statsCache.clear();
  statsCache.set('kpis', data);

  return data;
}


// --------- UI rendering ----------

function renderKpis(kpis) {
    if (!kpis || typeof kpis.totalRevenue === 'undefined') {
        const statsDisplay = document.getElementById('stats-kpis-display');
        statsDisplay.innerHTML = '<h3>Aucune Donnée Disponible</h3>';
        return;
    }

    const revenueEl = document.getElementById('totalRevenueDisplay');
    revenueEl.textContent = kpis.totalRevenue.toFixed(2) + '€';
    //to fixed pour arrondir au centimes


    const averageEl = document.getElementById('averageOrderValueDisplay');
    averageEl.textContent = kpis.averageOrderValue.toFixed(2) + ' €';

    const topProductEl = document.getElementById('topProductDisplay');
    if (kpis.topProduct && kpis.topProduct.length > 0) {
        const topItem = kpis.topProduct[0];
        topProductEl.textContent = `${topItem.title} (${topItem.total_sold} vendus)`;
    } else {
        topProductEl.textContent = 'N/A';
    }
}
// --------- Boot ----------

export async function initStats() {
  const refreshBtn = document.getElementById("refreshProductBtn");
  const listEl = document.getElementById("stats-list");

  try {

    renderKpis(await fetchStats());
  } catch (e) {
    console.error(e);
    toast("❌ Erreur au chargement Liste Statistiques", true);
  }

  // Rafraîchir
  refreshBtn.addEventListener("click", async () => {
    try {
      await fetchStats(); 
      renderKpis(await fetchStats());
      toast("Liste Statistiques rafraîchie", false);
    } catch (e) {
      console.error(e);
      toast("❌ Échec rafraîchissement Liste Statistiques")
    }
  });

}

