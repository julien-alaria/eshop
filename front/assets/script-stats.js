import { API_BASE, toast } from "./scripts-base.js"; 

const OVERVIEW_ROUTES = { 
  kpis: `${API_BASE}/?route=stats.kpis`, 
  daily_revenue: `${API_BASE}/?route=stats.revenue`, 
  order_status: `${API_BASE}/?route=stats.kpis`,
  top_products: `${API_BASE}/?route=stats.kpis`,
};

async function renderKpis() {
  const res = await fetch(OVERVIEW_ROUTES.kpis);
  if (!res.ok) throw new Error("Échec du chargement des KPIs.");
  const data = await res.json();
  
  document.getElementById('revenue').textContent = '$' + Number(data.totalRevenue).toFixed(2);
  document.getElementById('revenueLabel').textContent = 'From paid orders';
  document.getElementById('orders').textContent = data.orderCount;

  // Customers / Products - ajout par défaut si non dispo
  document.getElementById('customers').textContent = data.totalCustomerCount ?? 'N/A';
  document.getElementById('products').textContent = data.productCount ?? 'N/A';
  document.getElementById('productsLabel').textContent = (data.lowStockCount ?? 0) + ' low stock items';
}

async function renderDailyRevenueChart() {
  const res = await fetch(OVERVIEW_ROUTES.daily_revenue);
  if (!res.ok) throw new Error("Échec du chargement du graphique de revenus.");
  
  const { labels, values } = await res.json(); // directement destructuré

  new Chart(document.getElementById('dailyRevenueChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue ($)',
        data: values.map(v => parseFloat(v) || 0), // assure que ce sont bien des nombres
        borderColor: '#1d3557',
        backgroundColor: 'rgba(34,197,94,0.10)',
        fill: false,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#1d3557'
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}

async function renderOrderStatusChart() {
  const res = await fetch(OVERVIEW_ROUTES.order_status);
  if (!res.ok) throw new Error("Échec du chargement du statut des commandes.");
  const data = await res.json();

  const labels = data.statuses.map(s => s.status);
  const values = data.statuses.map(s => s.count);

  new Chart(document.getElementById('orderStatusChart').getContext('2d'), {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ["#ef476f", "#06d6a0", "#ffd166", "#118ab2"]
      }]
    },
    options: { plugins: { legend: { display: true } } }
  });
}

async function renderTopProductsChart() {
  const res = await fetch(OVERVIEW_ROUTES.top_products);
  if (!res.ok) throw new Error("Échec du chargement des meilleurs produits.");
  const data = await res.json();

  const top_products = data.topProduct ?? [];
  const labels = top_products.map(x => x.title);
  const values = top_products.map(x => x.total_sold);

  new Chart(document.getElementById('topProductsChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Units Sold',
        data: values,
        backgroundColor: '#1d3557'
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}

// --------- BOOT ----------

export async function initStats() {
  try {
    await Promise.all([
      renderKpis(),
      renderDailyRevenueChart(),
      renderOrderStatusChart(),
      renderTopProductsChart()
    ]);
  } catch (e) {
    console.error("Erreur lors du chargement de l'aperçu:", e);
    toast("❌ Erreur au chargement de l'Aperçu", true);
  }

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const root = document.body;
      const current = root.getAttribute("data-theme") || "light";
      root.setAttribute("data-theme", current === "light" ? "dark" : "light");
    });
  }
}

document.addEventListener("DOMContentLoaded", initStats);
