<?php 

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/exportModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

function exportOrdersCSV($pdo){
    $status = $_GET['status'] ?? null;
    $date_from = $_GET['date_from'] ?? null;
    $date_to = $_GET['date_to'] ?? null;
    $order_id = $_GET['order_id'] ?? null;
    $customer_id = $_GET['customer_id'] ?? null;
    $product_id = $_GET['product_id'] ?? null;
    $category_id = $_GET['category_id'] ?? null;

    $orders = getFilteredOrdersWithCustomer($pdo, $status, $date_from, $date_to, $order_id, $customer_id, $product_id, $category_id);

    header('Content_Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=orders_export.csv');
    $output = fopen('php://output' , 'w');
    if ($orders && count($orders) > 0) {
        fputcsv($output, array_keys($orders[0]));
        foreach($orders as $row) fputcsv($output, $row);
    }
    fclose($output);
    exit;
}