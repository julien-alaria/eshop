<?php 

function getTotalRevenue($pdo){
    return $pdo->query("SELECT SUM(total) FROM orders WHERE Status='paid' ")->fetchColumn();
}

function getOrderCount($pdo){
    return $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
}

function getAverageOrderValue($pdo){
    return $pdo->query("SELECT AVG(total) FROM orders WHERE status='paid' ")->fetchColumn();
}

function getOrderStatuses($pdo){
    return $pdo->query("SELECT status, COUNT(*) as count FROM orders GROUP BY status")->fetchAll(PDO::FETCH_ASSOC);
}

function getTopProduct($pdo){
    return $pdo->query(
        "SELECT p.title, SUM(oi.quantity) as total_sold FROM order_items oi JOIN products p ON oi.product_id = p.id
        GROUP BY oi.product_id ORDER BY total_sold DESC LIMIT 1"
    )->fetchAll(PDO::FETCH_ASSOC);
}

function getDailyRevenue($pdo) {
    return $pdo->query("
        SELECT DATE(created_at) as day, SUM(total) as revenue
        FROM orders
        WHERE status='paid'
        GROUP BY day
        ORDER BY day DESC
        LIMIT 30
    ")->fetchAll(PDO::FETCH_ASSOC);
}
