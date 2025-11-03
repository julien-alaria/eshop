<?php

function performGlobalSearch($pdo, $query) {
    
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

    $stmt = $pdo->prepare("SELECT * FROM orders WHERE customer_id LIKE ? OR status LIKE ? OR total LIKE ?");
    $stmt->execute([$search_term, $search_term, $search_term]);
    $results['orders'] = $stmt->fetchAll();

    return $results;
}