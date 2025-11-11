<?php 

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/orderModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

// ----------------- CRUD -----------------

function listOrders($pdo){
    $orders = getOrders($pdo);
    respond_json($orders);
}

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
    $items = $body['items'] ?? [];

    if(!$customer_id || !$status){
        respond_error('Missing Fields: customer_id, status', 400);
    }

    try {
        $order_id = addOrder($pdo, $customer_id, $status, $items);
    } catch(Exception $e){
        respond_error($e->getMessage(), 400);
    }

    respond_json(['order_id' => $order_id, 'message' => 'Order created successfully'], 201);
}


function editOrder($pdo, $id){
    if(!$id) respond_error('Order ID is required in URL.', 400);

    $body = parsed_body();

    $customer_id = isset($body['customer_id']) ? (int)$body['customer_id'] : 0;
    $status = $body['status'] ?? null;
    $total = isset($body['total']) ? (float)$body['total'] : null;

    if(!$customer_id || !$status || $total === null){
        respond_error('Missing Fields: customer_id, status, total', 400);
    }

    try {
        $success = updateOrder($pdo, (int)$id, $customer_id, $status, $total);
    } catch(Exception $e){
        respond_error($e->getMessage(), 400);
    }

    if($success){
        respond_json(['success' => true, 'message' => 'Order updated successfully']);
    } else {
        respond_json(['success' => false, 'message' => 'Update failed or no changes made.'], 200);
    }
}

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

function totalOrder($pdo, $id){
    if(!$id) respond_error('Order ID is required.', 400);

    $total = sumTotalOrder($pdo, $id);
    respond_json(['order_id' => (int)$id, 'total' => (float)$total]);
}
