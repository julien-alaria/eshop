<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/statsModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

/** ---------- Actions ---------- */

// function statsKpis(PDO $pdo): void {
//     respond_json([
//         "totalRevenue" => getTotalRevenue($pdo),
//         "orderCount" => getOrderCount($pdo),
//         "averageOrderValue" => getAverageOrderValue($pdo),
//         "statuses" => getOrderStatuses($pdo),
//         "topProducts" => getTopProducts($pdo, 1), // Ici on récupère juste le top 1
//     ]);
// }

function statsKpis(PDO $pdo): void {
    respond_json([
        "totalRevenue" => getTotalRevenue($pdo),
        "orderCount" => getOrderCount($pdo),
        "averageOrderValue" => getAverageOrderValue($pdo),
        "statuses" => getOrderStatuses($pdo),
        "topProducts" => getTopProducts($pdo, 1),
        // Ajout des nouveaux KPIs
        "totalCustomerCount" => getTotalCustomerCount($pdo),
        "lowStockCount" => getLowStockCount($pdo),
        "productCount" => getTotalProductCount($pdo),
    ]);
}

function statsRevenue(PDO $pdo): void {
    $rows = getDailyRevenue($pdo);

    // Transformer le résultat pour le front (labels + values)
    $labels = array_map(fn($row) => $row['day'], $rows);
    $values = array_map(fn($row) => (float) $row['revenue'], $rows);

    respond_json([
        "labels" => $labels,
        "values" => $values,
    ]);
}

function statsTopProducts(PDO $pdo, int $limit = 10): void {
    $products = getTopProducts($pdo, $limit);
    respond_json([
        "top_products" => $products
    ]);
}
