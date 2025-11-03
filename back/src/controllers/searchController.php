<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/customerModel.php';
require_once __DIR__ . '/../models/productModel.php';
require_once __DIR__ . '/../models/searchModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

/** ---------- Actions ---------- */

function globalSearch($pdo, $query) {
    $customers = performGlobalSearch($pdo, $query);
    respond_json($customers);
}