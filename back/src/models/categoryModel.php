<?php

function getCategories($pdo): array {
    $stmt = $pdo->query("SELECT id, name, created_at FROM categories ORDER BY name ASC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function setCategory($pdo, string $name): void {
    $stmt = $pdo->prepare("INSERT INTO categories (name) VALUES (?)");
    $stmt->execute([$name]);
}

function editCategory($pdo, int $id, string $name): void {
    $stmt = $pdo->prepare("UPDATE categories SET name = ? WHERE id = ?");
    $stmt->execute([$name, $id]);
}

function eraseCategory($pdo, int $id): void {
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);
}
