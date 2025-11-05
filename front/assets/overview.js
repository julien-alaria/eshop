import { API_BASE, toast } from "./scripts-base.js"; 

const OVERVIEW_ROUTES = { 
  kpis: `${API_BASE}/?route=stats.kpis`, 
  daily_revenue: `${API_BASE}/?route=stats.revenue`, 
  order_status: `${API_BASE}/?route=stats.status`,
  top_products: `${API_BASE}/?route=stats.topproduct&limit=10`, 
};

async function renderKpis() {
  const res = await fetch(OVERVIEW_ROUTES.kpis);
  if (!res.ok) throw new Error("Échec du chargement des KPIs.");
  const data = await res.json();
  
  document.getElementById('revenue').textContent = '$' + Number(data.totalRevenue).toFixed(2);
  document.getElementById('revenueLabel').textContent = 'From paid orders';
  document.getElementById('orders').textContent = data.orderCount;
  document.getElementById('customers').textContent = data.totalCustomerCount;
  document.getElementById('products').textContent = data.productCount; 
  document.getElementById('productsLabel').textContent = data.lowStockCount + ' low stock items'; 

}

async function renderDailyRevenueChart() {
  const res = await fetch(OVERVIEW_ROUTES.daily_revenue);
  if (!res.ok) throw new Error("Échec du chargement du graphique de revenus.");
  const { labels, values } = await res.json();

  new Chart(document.getElementById('dailyRevenueChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue ($)',
        data: values,
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
  const ordersByStatus = data.orders_by_status;
  const labels = Object.keys(ordersByStatus);
  const values = Object.values(ordersByStatus); 
  new Chart(document.getElementById('orderStatusChart').getContext('2d'), {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ["#06d6a0", "#ffd166", "#ef476f", "#118ab2"]
      }]
    },
    options: { plugins: { legend: { display: true } } }
  });
}

async function renderTopProductsChart() {
const res = await fetch(OVERVIEW_ROUTES.top_products);
  if (!res.ok) throw new Error("Échec du chargement des meilleurs produits.");
  const { top_products } = await res.json(); 
  
  const labels = top_products.map(x => x.title); 
  const values = top_products.map(x => x.qty);
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

// --------- Point d'entrée du module ----------

export async function initOverview() {
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

  // Toggle light/dark + animation
  themeToggle.addEventListener("click", () => {
    const root = document.body;
    const current = root.getAttribute("data-theme") || "light";
    root.setAttribute("data-theme", current === "light" ? "dark" : "light");
  });
}