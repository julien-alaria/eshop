<?php 

function getTotalRevenue(PDO $pdo): float {
    return (float) $pdo->query("SELECT SUM(total) FROM orders WHERE status='paid'")->fetchColumn();
}

function getOrderCount(PDO $pdo): int {
    return (int) $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
}

function getAverageOrderValue(PDO $pdo): float {
    return (float) $pdo->query("SELECT AVG(total) FROM orders WHERE status='paid'")->fetchColumn();
}

function getOrderStatuses(PDO $pdo): array {
    return $pdo->query("SELECT status, COUNT(*) as count FROM orders GROUP BY status")->fetchAll(PDO::FETCH_ASSOC);
}

function getTopProducts(PDO $pdo, int $limit = 10): array {
    $stmt = $pdo->prepare("
        SELECT p.title, SUM(oi.quantity) as qty
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY oi.product_id
        ORDER BY qty DESC
        LIMIT :limit
    ");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getDailyRevenue(PDO $pdo): array {
    return $pdo->query("
        SELECT DATE(created_at) as day, SUM(total) as revenue
        FROM orders
        WHERE status='paid'
        GROUP BY day
        ORDER BY day ASC
        LIMIT 30
    ")->fetchAll(PDO::FETCH_ASSOC);
}

function getTotalCustomerCount(PDO $pdo): int {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM customers");
    return (int) $stmt->fetch(PDO::FETCH_ASSOC)['count'];
}

function getLowStockCount(PDO $pdo, int $threshold = 5): int {
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM products WHERE stock <= :threshold");
    $stmt->execute(['threshold' => $threshold]);
    return (int) $stmt->fetch(PDO::FETCH_ASSOC)['count'];
}

function getTotalProductCount(PDO $pdo): int {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products");
    return (int) $stmt->fetch(PDO::FETCH_ASSOC)['count'];
}


