<?php

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/categoryModel.php';
require_once __DIR__ . '/../helpers/helpers.php'; 

function listCategories($pdo) {
    $categories = getCategories($pdo);
    
    respond_json($categories); 
}

// function insertCategorie($pdo, $name) {
//     $categorie = setCategorie($pdo, $name);

//     respond_json($categorie);
// }

// function editCategorie($pdo, $id, $name) {
//     $categorie = updateCategorie($pdo, $id, $name);

//     respond_json($categorie);
// }

// function deleteCategorie($pdo, $id) {
//     $categorie = eraseCategorie($pdo, $id);

//     respond_json($categorie);  
// }

function createCategorie($pdo) {
    if (($_SERVER['REQUEST_METHOD']) !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
        return;
    }

    $input = parsed_body();

    $name = s((string)($input['name'] ?? ''));
    if ($name === '') {
        respond_error('Le nom de la catégorie est requis', 422);
    }

    setCategorie($pdo, $name);
    respond_json(['message' => 'success'], 201);
    
}

function editCategorie($pdo, $id) {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }

    $id = (int)$id;
    if ($id < 1) {
        respond_error('ID invalide', 400);
    }

    $input = parsed_body();
    $name = s((string)($input['name'] ?? ''));

    if ($name === '') {
        respond_error('Le nom de la catégorie est requis', 422);
    }

    updateCategorie($pdo, $id, $name);

    respond_json(['message' => 'updated']);
}

function deleteCategorie($pdo, $id) {
    $hasDeleteFlag = isset($_GET['delete']) || isset($_POST['delete']);
    if (!$hasDeleteFlag) {
        respond_error('paramètre delete manquant', 400);
        return;
    }

    $id = (int)$id;
    if ($id < 1) {
        respond_error('ID invalide', 400);
        return;
    }

    eraseCategorie($pdo, $id);
    respond_json(['message' => 'deleted']);
}