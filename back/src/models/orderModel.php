<?php

// --- GET ORDERS ---

function getOrders($pdo){
    $sql = "SELECT o.*, c.name AS customer_name, c.email 
            FROM orders o 
            JOIN customers c ON o.customer_id = c.id 
            ORDER BY o.created_at DESC";
    return $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}

function getOrderById($pdo, $id){
    $sql = "SELECT o.*, c.name AS customer_name, c.email 
            FROM orders o 
            JOIN customers c ON o.customer_id = c.id 
            WHERE o.id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$order) return null;

    // fetch order items
    $sql_items = "SELECT oi.*, p.title 
                  FROM order_items oi 
                  JOIN products p ON oi.product_id = p.id 
                  WHERE oi.order_id = ?";
    $items_stmt = $pdo->prepare($sql_items);
    $items_stmt->execute([$id]);
    $order['items'] = $items_stmt->fetchAll(PDO::FETCH_ASSOC);

    return $order;
}

// --- ADD ORDER ---

function addOrder($pdo, $customer_id, $status = 'pending', $items = []){
    $total = 0;
    foreach ($items as $item) {
        $total += $item['quantity'] * $item['unit_price'];
    }

    $sql = "INSERT INTO orders(customer_id, status, total) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$customer_id, $status, $total]);
    $order_id = $pdo->lastInsertId();

    foreach ($items as $item) {
        addOrderItem($pdo, $order_id, $item['product_id'], $item['quantity'], $item['unit_price']);
    }

    return $order_id;
}

// --- ADD ORDER ITEM ---

function addOrderItem($pdo, $order_id, $product_id, $quantity, $unit_price){
    $sql = "INSERT INTO order_items(order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$order_id, $product_id, $quantity, $unit_price]);

    // update total of the order
    updateOrderTotal($pdo, $order_id);
}

// --- UPDATE ORDER TOTAL ---

function updateOrderTotal($pdo, $order_id){
    $sql = "SELECT SUM(quantity * unit_price) AS total FROM order_items WHERE order_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$order_id]);
    $total = $stmt->fetchColumn() ?? 0;

    $sql_update = "UPDATE orders SET total = ? WHERE id = ?";
    $stmt_update = $pdo->prepare($sql_update);
    $stmt_update->execute([$total, $order_id]);
}

// --- UPDATE ORDER ---

function updateOrder($pdo, $id, $customer_id, $status){
    $validStatuses = ['pending', 'paid', 'refunded', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        throw new InvalidArgumentException("Status '$status' invalide. Doit être : " . implode(', ', $validStatuses));
    }

    $total = sumTotalOrder($pdo, $id);

    $sql = "UPDATE orders SET customer_id = ?, status = ?, total = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([$customer_id, $status, $total, $id]);
}

// --- DELETE ORDER ---

function deleteOrder($pdo, $id){
    $sql_items = "DELETE FROM order_items WHERE order_id = ?";
    $items_stmt = $pdo->prepare($sql_items);
    $items_stmt->execute([$id]);

    $sql = "DELETE FROM orders WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([$id]);
}

// --- SUM TOTAL ORDER ---

function sumTotalOrder($pdo, $id){
    $sql = "SELECT SUM(quantity * unit_price) AS total FROM order_items WHERE order_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result['total'] ?? 0;
}
