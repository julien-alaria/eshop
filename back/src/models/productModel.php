<?php

function getProducts($pdo)
{
    $sql = "SELECT p.*, c.name as category FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC";
    return $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}

function addProduct($pdo, $sku, $title, $price, $stock, $category_id = null)
{
    $sql = "INSERT INTO products (sku, title, price, stock, category_id) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$sku, $title, $price, $stock, $category_id]);
}

function updateProduct($pdo, $id, $sku, $title, $price, $stock, $category_id = null)
{
    $stmt = $pdo->prepare("UPDATE products SET sku = ?, title = ?, price = ?, stock = ?, category_id = ? WHERE id = ?");
    $stmt->execute([$sku, $title, $price, $stock, $category_id, $id]);
}

function deleteProduct($pdo, $id)
{
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
}

