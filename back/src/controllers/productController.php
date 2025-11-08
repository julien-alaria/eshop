<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/productModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

/** ---------- Actions ---------- */

function listProducts($pdo): void {
    try {
        $products = getProducts($pdo);
        respond_json($products);
    } catch (Throwable $e) {
        respond_error($e->getMessage(), 500);
    }
}

function createProduct($pdo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }

    $input = parsed_body();

    $sku   = s((string)($input['sku']   ?? ''));
    $title = s((string)($input['title']   ?? ''));
    $price = s((string)($input['price'] ?? ''));
    $stock = s((string)($input['stock'] ?? ''));
    $category_id = $input['category_id'] ?? null;

    if ($sku === '' || $title === '' || $price === '' || $stock === '') {
        respond_error('sku, title, price et stock sont requis', 422); // HTTP Code erreur
    }

    if(!is_numeric($price) || !is_numeric($stock)){
        respond_error('prix et stock doivent être numériques', 422);
    }

    if ($category_id !== null && !ctype_digit((string)$category_id)){
        respond_error('category_id doit être un entier ou null', 422);
    }
    addProduct($pdo, $sku, $title, $price, $stock, $category_id);
    respond_json(['message' => 'success'], 201);
}

function editProduct($pdo, $id): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }

    $id = (int)$id;
    if ($id < 1) {
        respond_error('id invalide', 400);
    }

    $input = parsed_body();
    $sku   = s((string)($input['sku'] ?? ''));
    $title = s((string)($input['title'] ?? ''));
    $price = s((string)($input['price'] ?? ''));
    $stock = s((string)($input['stock'] ?? ''));
    $category_id = $input['category'] ??  null;

    if ($sku === '' || $title === '' || $price === '' || $stock === '') {
        respond_error('sku, title, price et stock sont requis', 422);
    }

    if(!is_numeric($price) || !is_numeric($stock)){
        respond_error('price et stock doivent être numériques', 422);
    }

    if($category_id !== null && !ctype_digit((string)$category_id)){
        respond_error('category_id doit être un entier ou null', 422);
    }

    updateProduct($pdo, $id, $sku, $title, $price, $stock, $category_id);
    respond_json(['message' => 'updated']);
}

function removeProduct($pdo, $id){
    if(($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET'){
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }

    $id = (int)$id;
    if($id < 1) {
        respond_error('id invalide', 400);
    }

    deleteProduct($pdo, $id);
    respond_json(['message' => 'delete']);
}