import { initCustomers } from './script-customers.js';
import { initProducts } from './script-products.js';
import { initStats } from './script-stats.js';
import { initCategory } from './script-category.js';

async function mainInit() {
    await initCustomers();
    await initProducts();
    await initStats();
    await initCategory();
}

document.addEventListener("DOMContentLoaded", mainInit);