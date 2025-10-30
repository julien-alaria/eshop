<?php

function getCustomers($pdo)
{
    return $pdo->query("SELECT * FROM customers ORDER BY created_at DESC")->fetchAll();
}

function addCustomer($pdo, $email, $name)
{
    $stmt = $pdo->prepare("INSERT INTO customers (email, name) VALUES (?, ?)");
    $stmt->execute([$email, $name]);
}

function deleteCustomer($pdo, $id)
{
    $stmt = $pdo->prepare("DELETE FROM customers WHERE id = ?");
    $stmt->execute([$id]);
}

function updateCustomer($pdo, $id, $email, $name)
{
    $stmt = $pdo->prepare("UPDATE customers SET email = ?, name = ? WHERE id = ?");
    $stmt->execute([$email, $name, $id]);
}

function globalSearch($pdo, $query) {
    $results = [];
    $search_term  = "%" . $query . "%";

    $stmt = $pdo->prepare("SELECT * FROM customers WHERE name LIKE ? OR email LIKE?");
    $stmt->execute([$search_term, $search_term]);
    $results['customers'] = $stmt->fetchAll();

    $stmt = $pdo->prepare("SELECT * FROM categories WHERE name LIKE ?");
    $stmt->execute([$search_term]);
    $results['categories'] = $stmt->fetchAll();

    $stmt = $pdo->prepare("SELECT * FROM products WHERE sku LIKE ? OR title LIKE ? OR price LIKE ? OR stock LIKE ?");
    $stmt->execute([$search_term, $search_term, $search_term, $search_term]);
    $results['products'] = $stmt->fetchAll();

    return $results;
}