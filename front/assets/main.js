import { initCustomers } from './script-customers.js';
import { initProducts } from './script-products.js';

async function mainInit() {
    await initCustomers();
    await initProducts();
}

document.addEventListener("DOMContentLoaded", mainInit);