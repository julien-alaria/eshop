<?php
require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/orderModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

// ----------------- CRUD -----------------

// Lister toutes les commandes
function listOrders($pdo){
    $orders = getOrders($pdo);
    respond_json($orders);
}

// Afficher une commande par ID
function showOrder($pdo, $id){
    if(!$id) respond_error('Order ID is required.', 400);

    $order = getOrderById($pdo, $id);
    if(!$order) respond_error('Order not found.', 404);

    respond_json($order);
}

function createOrder($pdo){
    $body = parsed_body();

    $customer_id = isset($body['customer_id']) ? (int)$body['customer_id'] : 0;
    $status = $body['status'] ?? null;
    $product_id = isset($body['product_id']) ? (int)$body['product_id'] : 0;
    $quantity = isset($body['quantity']) ? (int)$body['quantity'] : 1;

    if(!$customer_id || !$status || !$product_id || $quantity < 1){
        respond_error('Missing or invalid fields: customer_id, status, product_id, quantity', 400);
    }

    // Construire le tableau items pour le modèle
    $items = [
        [
            'product_id' => $product_id,
            'quantity'   => $quantity
        ]
    ];

    try {
        $order_id = addOrder($pdo, $customer_id, $status, $items);
    } catch(Exception $e){
        respond_error($e->getMessage(), 400);
    }

    respond_json(['order_id' => $order_id, 'message' => 'Order created successfully'], 201);
}


// Éditer une commande (sans total)
function editOrder($pdo, $id){
    if(!$id) respond_error('Order ID is required in URL.', 400);

    $body = parsed_body();

    $customer_id = isset($body['customer_id']) ? (int)$body['customer_id'] : 0;
    $status = $body['status'] ?? null;

    if(!$customer_id || !$status){
        respond_error('Missing Fields: customer_id, status', 400);
    }

    try {
        $success = updateOrder($pdo, (int)$id, $customer_id, $status);
    } catch(Exception $e){
        respond_error($e->getMessage(), 400);
    }

    if($success){
        respond_json(['success' => true, 'message' => 'Order updated successfully']);
    } else {
        respond_json(['success' => false, 'message' => 'Update failed or no changes made.'], 200);
    }
}

// Supprimer une commande
function removeOrder($pdo, $id){
    if(!$id) respond_error('Order ID is required in URL.', 400);

    $success = deleteOrder($pdo, (int)$id);

    if($success){
        respond_json(['success' => true, 'message' => 'Order deleted successfully']);
    } else {
        respond_json(['success' => false, 'message' => 'Deletion failed.'], 404);
    }
}

// ----------------- Fonctions supplémentaires -----------------

// Récupérer le total d'une commande
function totalOrder($pdo, $id){
    if(!$id) respond_error('Order ID is required.', 400);

    $total = sumTotalOrder($pdo, $id);
    respond_json(['order_id' => (int)$id, 'total' => (float)$total]);
}
