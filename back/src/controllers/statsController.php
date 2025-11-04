<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/statsModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

/** ---------- Actions ---------- */

function statsKpis($pdo){
  
    respond_json([
        "totalRevenue" => (float) getTotalRevenue($pdo),
        "orderCount" => (int) getOrderCount($pdo),
        "averageOrderValue" => (float) getAverageOrderValue($pdo),
        "statuses" => getOrderStatuses($pdo),
        "topProduct" => getTopProduct($pdo),
    ]);
}

function statsRevenue($pdo) {
    $dailyData = getDailyrevenue($pdo);

    $labels = [];
    $values = [];

    foreach ($dailyData as $row) {
        $labels[] = $row['day'];
        $values[] = $row['revenue'];
    }
    respond_json([
        "labels" => $labels,
        "values" => $values
    ]);
}

function statsTopProduct($pdo) {
    $topProductData = getTopProduct($pdo);

    $formattedData = [];

    foreach ($topProductData as $row) {
        $formattedData[] = [
            'title' => $row['title'],
            'qty' => $row['total_sold']
        ];
    }
    respond_json(["top_products" => $formattedData]);
}

function statStatuses($pdo) {
    $statusArray = getOrderStatuses($pdo);

    $statusObject= [];

    foreach ($statusArray as $row) {
        $statusObject[$row['status']] = $row['count'];
    }

    respond_json([
        "orders_by_status" => $statusObject
    ]);
}