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
    respond_json(getDailyRevenue($pdo));
}
