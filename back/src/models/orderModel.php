<?php

// ----------------- LIST / SHOW -----------------

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

// ----------------- CREATE ORDER -----------------

function addOrder($pdo, $customer_id, $status = 'pending', $items = []) {
    if (!$customer_id || !$status || empty($items)) {
        throw new InvalidArgumentException("customer_id, status et items sont requis.");
    }

    $pdo->beginTransaction();
    try {
        // Créer la commande avec total = 0
        $stmt = $pdo->prepare("INSERT INTO orders (customer_id, status, total) VALUES (?, ?, 0)");
        $stmt->execute([$customer_id, $status]);
        $order_id = $pdo->lastInsertId();

        // Ajouter tous les items
        foreach ($items as $item) {
            $product_id = (int)$item['product_id'];
            $quantity   = (int)$item['quantity'];

            $stmtProd = $pdo->prepare("SELECT price FROM products WHERE id = ?");
            $stmtProd->execute([$product_id]);
            $unit_price = (float)$stmtProd->fetchColumn();

            addOrderItem($pdo, $order_id, $product_id, $quantity, $unit_price, false);
        }

        // Calculer le total après avoir ajouté tous les items
        updateOrderTotal($pdo, $order_id);

        $pdo->commit();
        return $order_id;
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

// ----------------- ADD ITEM -----------------

function addOrderItem($pdo, $order_id, $product_id, $quantity, $unit_price, $updateTotal = true) {
    $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
    $stmt->execute([$order_id, $product_id, $quantity, $unit_price]);

    if($updateTotal) {
        updateOrderTotal($pdo, $order_id);
    }
}

// ----------------- UPDATE TOTAL -----------------

function updateOrderTotal($pdo, $order_id) {
    $stmt = $pdo->prepare("SELECT SUM(quantity * unit_price) AS total FROM order_items WHERE order_id = ?");
    $stmt->execute([$order_id]);
    $total = (float)($stmt->fetchColumn() ?? 0);

    $stmt_update = $pdo->prepare("UPDATE orders SET total = ? WHERE id = ?");
    $stmt_update->execute([$total, $order_id]);
}

// ----------------- DELETE -----------------

function deleteOrder($pdo, $id){
    $pdo->beginTransaction();
    try {
        $stmt_items = $pdo->prepare("DELETE FROM order_items WHERE order_id = ?");
        $stmt_items->execute([$id]);

        $stmt_order = $pdo->prepare("DELETE FROM orders WHERE id = ?");
        $stmt_order->execute([$id]);

        $pdo->commit();
        return true;
    } catch (Exception $e) {
        $pdo->rollBack();
        return false;
    }
}

// ----------------- SUM TOTAL -----------------

function sumTotalOrder($pdo, $id){
    $stmt = $pdo->prepare("SELECT SUM(quantity * unit_price) AS total FROM order_items WHERE order_id = ?");
    $stmt->execute([$id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return (float)($result['total'] ?? 0);
}

// ----------------- UPDATE ORDER -----------------

function updateOrder($pdo, $id, $customer_id, $status, $items = null){
    $validStatuses = ['pending', 'paid', 'refunded', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        throw new InvalidArgumentException("Status '$status' invalide. Doit être : " . implode(', ', $validStatuses));
    }

    $pdo->beginTransaction();
    try {
        // Mettre à jour le client et le statut
        $stmt = $pdo->prepare("UPDATE orders SET customer_id = ?, status = ? WHERE id = ?");
        $stmt->execute([$customer_id, $status, $id]);

        // Si des items sont fournis, les remplacer
        if (is_array($items)) {
            $stmtDel = $pdo->prepare("DELETE FROM order_items WHERE order_id = ?");
            $stmtDel->execute([$id]);

            foreach ($items as $item) {
                addOrderItem($pdo, $id, $item['product_id'], $item['quantity'], $item['unit_price'], false);
            }
        }

        // Recalculer le total après modification
        updateOrderTotal($pdo, $id);

        $pdo->commit();
        return true;
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}
