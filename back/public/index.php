<?php

require_once __DIR__ . '/../src/helpers/helpers.php';
require_once __DIR__ . '/../src/controllers/productController.php';
require_once __DIR__ . '/../src/controllers/customerController.php';
require_once __DIR__ . '/../src/controllers/categoryController.php';
require_once __DIR__ . '/../src/controllers/orderController.php';
require_once __DIR__ . '/../src/controllers/statsController.php';
require_once __DIR__ . '/../src/controllers/exportController.php';
require_once __DIR__ . '/../src/controllers/searchController.php';

error_reporting(E_ALL);
ini_set('display_errors', '1');

$route = $_GET['route'] ?? 'customer.index';

switch ($route) {

    // Products
    case 'product.index': listProducts($pdo); break;
    case 'product.create': createProduct($pdo); break;
    case 'product.edit': editProduct($pdo, $_GET['id'] ?? null); break;
    case 'product.delete': removeProduct($pdo, $_GET['id'] ?? null); break;

    // Orders
    case 'orders.list': listOrders($pdo); break;
    case 'orders.show': showOrder($pdo, $_GET['id'] ?? null); break;
    case 'orders.create': createOrder($pdo); break;
    case 'orders.edit': editOrder($pdo, $_GET['id'] ?? null); break;
    case 'orders.delete': removeOrder($pdo, $_GET['id'] ?? null); break;

   // Customers
    case 'customer.index': listCustomers($pdo); break;
    case 'customer.create': createCustomer($pdo); break;
    case 'customer.edit': editCustomer($pdo, $_GET['id'] ?? null); break;
    case 'customer.delete': removeCustomer($pdo, $_GET['id'] ?? null); break;

    // Categories
    case 'category.index': listCategories($pdo); break;
    case 'category.create': createCategory($pdo); break;
    case 'category.edit': editCategoryController($pdo, $_GET['id'] ?? null); break;
    case 'category.delete': deleteCategoryController($pdo, $_GET['id'] ?? null); break;

    // Search
    case 'global.search': globalSearch($pdo, $_GET['query'] ?? ''); break;

    // Stats
    case 'stats.kpis': statsKpis($pdo); break;
    case 'stats.revenue': statsRevenue($pdo); break;

    // Export
    case 'orders.export': exportOrdersCsv($pdo); break;

    // Default
    default:
        http_response_code(404);
        echo json_encode(["message" => "Not Found"]);
        break;
}
