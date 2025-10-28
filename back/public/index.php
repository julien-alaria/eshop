<?php
require_once __DIR__ . '/../src/controllers/noteController.php';

$route = $_GET['route'] ?? 'customer.index';


switch ($route) {

    case 'customer.index':
        listCustomers($pdo);
        break;
    case 'customer.create':
        createCustomer($pdo, $_POST['email'] ?? '', $_POST['name'] ?? '');
        break;
    case 'customer.edit':
        if (isset($_GET['id'])) {
            editCustomer($pdo, $_GET['id'], $_POST['title'] ?? '', $_POST['content'] ?? '');
        }
        break;
    case 'customer.delete':
        if (isset($_GET['id'])) {
            removeCustomer($pdo, $_GET['id']);
        }
        break;
    default:
        http_response_code(404);
        echo json_encode(["message" => "Not Found"]);
        break;
}