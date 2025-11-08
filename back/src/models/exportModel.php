<?php 

function getFilteredOrdersWithCustomer($pdo, $status = null, $date_from = null, $date_to = null, $order_id = null, $customer_id = null, $product_id = null, $category_id = null) {
    $sql = "SELECT 
                o.id,
                o.customer_id,
                c.name AS customer_name,
                o.total,
                o.status,
                o.created_at,
                GROUP_CONCAT(p.title, ', ') AS product_titles
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN categories cat ON p.category_id = cat.id
            WHERE 1";
    $params = [];

    if ($status) { $sql .= " AND o.status = ?"; $params[] = $status; }
    if ($date_from) { $sql .= " AND o.created_at >= ?"; $params[] = $date_from; }
    if ($date_to) { $sql .= " AND o.created_at <= ?"; $params[] = $date_to; }
    if ($order_id) { $sql .= " AND o.id = ?"; $params[] = $order_id; }
    if ($customer_id) { $sql .= " AND o.customer_id = ?"; $params[] = $customer_id; }
    if ($product_id) { $sql .= " AND oi.product_id = ?"; $params[] = $product_id; }
    if ($category_id) { $sql .= " AND p.category_id = ?"; $params[] = $category_id; }

    $sql .= " GROUP BY o.id ORDER BY o.created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
