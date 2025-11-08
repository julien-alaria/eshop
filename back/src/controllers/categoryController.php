<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/categoryModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

/** ---------- Actions ---------- */

function createCategory($pdo): void {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }

    $input = parsed_body();
    $name = s((string)($input['name'] ?? ''));

    if ($name === '') {
        respond_error('Le nom est requis', 422);
    }

    setCategory($pdo, $name);
    respond_json(['message' => 'success'], 201);
}

function editCategoryController($pdo, $id): void {
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
        respond_error('Le nom est requis', 422);
    }

    editCategory($pdo, $id, $name);
    respond_json(['message' => 'updated']);
}

function listCategories($pdo): void {
    $categories = getCategories($pdo);
    respond_json($categories); // toujours renvoyer un tableau
}

function deleteCategoryController($pdo, $id): void {
    $hasDeleteFlag = isset($_GET['delete']) || isset($_POST['delete']);
    if (!$hasDeleteFlag) {
        respond_error('Paramètre delete manquant', 400);
    }

    $id = (int)$id;
    if ($id < 1) {
        respond_error('ID invalide', 400);
    }

    eraseCategory($pdo, $id);
    respond_json(['message' => 'deleted']);
}
