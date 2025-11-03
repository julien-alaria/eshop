<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/customerModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

/** ---------- Actions ---------- */

function createCustomer($pdo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }

    $input = parsed_body();

    $email   = s((string)($input['email']   ?? ''));
    $name = s((string)($input['name'] ?? ''));

    if ($email === '' || $name === '') {
        respond_error('title et content sont requis', 422); // HTTP Code erreur
    }

    addCustomer($pdo, $email, $name);
    respond_json(['message' => 'success'], 201);
}

function editCustomer($pdo, $id): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond_error('Method Not Allowed', 405, ['allowed' => ['POST', 'OPTIONS']]);
    }

    $id = (int)$id;
    if ($id < 1) {
        respond_error('id invalide', 400);
    }

    $in = parsed_body();
    $email   = s((string)($in['email']   ?? ''));
    $name = s((string)($in['name'] ?? ''));

    if ($email === '' || $name === '') {
        respond_error('title et content sont requis', 422);
    }

    updateCustomer($pdo, $id, $email, $name);
    respond_json(['message' => 'updated']);
}

function listCustomers($pdo): void
{
    $customers = getCustomers($pdo);
    respond_json($customers);
}

function removeCustomer($pdo, $id): void
{
    $hasDeleteFlag = isset($_GET['delete']) || isset($_POST['delete']);
    if (!$hasDeleteFlag) {
        respond_error('paramètre delete manquant', 400);
    }

    $id = (int)$id;
    if ($id < 1) {
        respond_error('id invalide', 400);
    }

    deleteCustomer($pdo, $id);
    respond_json(['message' => 'deleted']);
}

function searchCustomer($pdo, $query) {
    $customers = globalSearch($pdo, $query);
    respond_json($customers);
}