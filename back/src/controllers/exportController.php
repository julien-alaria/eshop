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

// PRODUCTS EXPORT

function exportProductsCSV($pdo) {
    $products = getAllProductsWithCategory($pdo);
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=products_export.csv');
    $output = fopen('php://output', 'w');
    if ($products && count($products) > 0) {
        fputcsv($output, array_keys($products[0]));
        foreach ($products as $row) fputcsv($output, $row);
    }
    fclose($output);
    exit;
}

// CUSTOMER EXPORT

function exportCustomersCSV($pdo) {
    $customers = getAllCustomersWithStats($pdo);
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=customers_export.csv');
    $output = fopen('php://output', 'w');
    if ($customers && count($customers) > 0) {
        fputcsv($output, array_keys($customers[0]));
        foreach ($customers as $row) fputcsv($output, $row);
    }
    fclose($output);
    exit;
}

// STATS KPIS EXPORT

function exportStatsCSV($pdo) {
    // Directly build the stats array, just like in statsKpis
    $kpis = [
        "totalRevenue"      => (float) getTotalRevenue($pdo),
        "orderCount"        => (int) getOrderCount($pdo),
        "averageOrderValue" => (float) getAverageOrderValue($pdo),
        "statuses"          => getOrderStatuses($pdo),
        "topProduct"        => getTopProduct($pdo),
    ];

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=stats_export.csv');
    $output = fopen('php://output', 'w');
    foreach ($kpis as $key => $value) {
        fputcsv($output, [$key, is_array($value) ? json_encode($value) : $value]);
    }
    fclose($output);
    exit;
}
