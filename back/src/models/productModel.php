<?php

function getProducts($pdo){
    $sql = "SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC";
    return $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}

function getProductById($pdo, $id){
    $sql = "SELECT * FROM products WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function addProduct($pdo, $sku, $title, $price, $stock, $category_id = null){
    $sql = "INSERT INTO products(sku, title, price, stock, category_id) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$sku, $title, $price, $stock, $category_id]);
    return $pdo->lastInsertId();
}

function updateProduct($pdo, $id, $sku, $title, $price, $stock, $category_id = null){
    $sql = "UPDATE products SET sku = ?, title = ?, price = ?, stock = ?, category_id = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([$sku, $title, $price, $stock, $category_id, $id]);
}

function deleteProduct($pdo, $id){
    $sql = "DELETE FROM products WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([$id]);
}
