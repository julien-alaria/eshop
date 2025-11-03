<?php

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/categoryModel.php';
require_once __DIR__ . '/../helpers/helpers.php'; 

function listCategories($pdo) {
    $categories = getCategories($pdo);
    
    respond_json($categories); 
}

// autres fonctions CRUD si nécessaire (createCategory, editCategory, etc.)