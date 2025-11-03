<?php
function getCategories($pdo) {
    $stmt = $pdo->query("SELECT id, name FROM categories ORDER BY name ASC");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    respond_json($categories); 
}

// Ajoutez ici d'autres fonctions CRUD si nécessaire (createCategory, editCategory, etc.)