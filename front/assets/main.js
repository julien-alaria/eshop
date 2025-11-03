import { initCustomers } from './script-customers.js';
import { initProducts } from './script-products.js';
import { initStats } from './script-stats.js';

async function mainInit() {
    await initCustomers();
    await initProducts();
    await initStats();
}

document.addEventListener("DOMContentLoaded", mainInit);