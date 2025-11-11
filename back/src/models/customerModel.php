<?php

function getCustomers($pdo){
    $sql = "SELECT * FROM customers ORDER BY created_at DESC";
    return $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}

function getCustomerById($pdo, $id){
    $sql = "SELECT * FROM customers WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function addCustomer($pdo, $name, $email){
    $sql = "INSERT INTO customers(name, email) VALUES (?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name, $email]);
    return $pdo->lastInsertId();
}

function updateCustomer($pdo, $id, $name, $email){
    $sql = "UPDATE customers SET name = ?, email = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([$name, $email, $id]);
}

function deleteCustomer($pdo, $id){
    $sql = "DELETE FROM customers WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([$id]);
}
