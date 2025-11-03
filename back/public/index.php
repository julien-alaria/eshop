<?php

$route = $_GET['route'] ?? 'customer.index';

// error_reporting(E_ALL);
// ini_set('display_errors', '1');

/** CORS + JSON pour toutes les réponses */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

/** Préflight CORS */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../src/controllers/productController.php';
require_once __DIR__ . '/../src/controllers/customerController.php';
require_once __DIR__ . '/../src/controllers/categoryController.php';
require_once __DIR__ . '/../src/controllers/orderController.php';
require_once __DIR__ . '/../src/controllers/statsContorller.php';
require_once __DIR__ . '/../src/controllers/exportController.php';
require_once __DIR__ . '/../src/controllers/searchController.php';

$route = $_GET['route'] ?? 'customer.index';

switch ($route) {

  // Product
  case 'product.index':
    listProducts($pdo);
    break;

  case 'product.create':
    createProduct($pdo);
    break;

  case 'product.edit':
    if (isset($_GET['id'])) {
      editProduct($pdo, $_GET['id']);
    }
    break;

  case 'product.delete':
    if (isset($_GET['id'])) {
      removeProduct($pdo, $_GET['id']);
    }
    break;

  // Orders

  case 'orders.list':
    listOrders($pdo);
    break;

  case 'orders.show':
    if(isset($_GET['id'])) {
      showOrder($pdo, $_GET['id']);
    } else { respond_json(['error' => 'ID required'], 400);
    }
    break;

  case 'orders.create':
    createOrder($pdo);
    break;

  case 'orders.edit':
    if (isset($_GET['id'])) {
      editOrder($pdo, $_GET['id']);
    } else {respond_json(['error' => 'ID required'], 400);
    }
    break;

  case 'orders.delete':
    if (isset($_GET['id'])) {
      removeOrder($pdo, $_GET['id']);
    }else {respond_json(['error' => 'ID required'], 400);
    }
    break;

// Customers

  case 'customer.index':
  listCustomers($pdo);
  break;

  case 'customer.create':
      createCustomer($pdo, $_POST['email'] ?? '', $_POST['name'] ?? '');
      break;

  case 'customer.edit':
      if (isset($_GET['id'])) {
          editCustomer($pdo, $_GET['id'], $_POST['email'] ?? '', $_POST['name'] ?? '');
      }
      break;

  case 'customer.delete':
      if (isset($_GET['id'])) {
          removeCustomer($pdo, $_GET['id']);
      }
      break;

// Global Search
  case 'global.search':
      if (isset($_GET['query'])) {
          globalSearch($pdo, $_GET['query'] ?? '');
      }
      break;

//  stats

  case 'stats.kpis':
    statsKpis($pdo);
    break;

  case 'stats.revenue':
    statsRevenue($pdo);
    break;

// Categories
case 'category.index':
  listCategories($pdo);
  break;

//  CSV export data

  case 'orders.export':
    exportOrdersCsv($pdo);
    break;


  default;
    http_response_code(404);
    echo json_encode(["message" => "Not Found"]);
    break; 
}









 