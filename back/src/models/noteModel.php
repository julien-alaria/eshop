<?php

// function getNotes($pdo)
// {
//     return $pdo->query("SELECT * FROM notes ORDER BY created_at DESC")->fetchAll();
// }

// function addNote($pdo, $title, $content)
// {
//     $stmt = $pdo->prepare("INSERT INTO notes (title, content) VALUES (?, ?)");
//     $stmt->execute([$title, $content]);
// }

// function deleteNote($pdo, $id)
// {
//     $stmt = $pdo->prepare("DELETE FROM notes WHERE id = ?");
//     $stmt->execute([$id]);
// }

// function updateNote($pdo, $id, $title, $content)
// {
//     $stmt = $pdo->prepare("UPDATE notes SET title = ?, content = ? WHERE id = ?");
//     $stmt->execute([$title, $content, $id]);
// }

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