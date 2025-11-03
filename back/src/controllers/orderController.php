<?php 

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/orderModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

function listOrders($pdo){
    $orders = getOrders($pdo);
    respond_json($orders);
}

function showOrder($pdo, $id){
    $order = getOrderById($pdo, $id);
    if($order) respond_json($order);
    else respond_json(['error' => 'Not Found'], 404);
}


function createOrder($pdo){
    $json = json_decode(file_get_contents('php://input'), true);
    if(!isset($json['customer_id'], $json['status'], $json['total'], $json['items'])){
        respond_json(['error' => 'Missing Fields'], 400);
    }
    $order_id = addOrder(
        $pdo,
        $json['customer_id'],
        $json['status'],
        $json['total'],
        $json['items']
    );
    respond_json(['order_id' => $order_id], 201);
}

function editOrder($pdo, $id){
    $json = json_decode(file_get_contents('php://input'), true);
    if(!isset($json['status'], $json['total'])){
        respond_json(['error' => 'Missing Fields'], 400);
    }
    $success = updateOrder($pdo, $id, $json['status'], $json['total']);
    respond_json(['success' => $success]);
}

function removeOrder($pdo, $id){
    $success = deleteOrder($pdo, $id);
    respond_json(['success' => $success]);
}
