<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/db.php';
require_once __DIR__ . '/../models/customerModel.php';
require_once __DIR__ . '/../helpers/helpers.php';

function listCustomers($pdo): void
{
    $customers = getCustomers($pdo);
    respond_json([
        'success' => true,
        'data' => $customers,
    ]);
}

function createCustomer($pdo): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond_error('Méthode non autorisée', 405, ['allowed' => ['POST']]);
    }

    $input = parsed_body();
    $email = trim((string)($input['email'] ?? ''));
    $name  = trim((string)($input['name'] ?? ''));

    if ($email === '' || $name === '') {
        respond_error('Email et nom sont requis', 422);
    }

    addCustomer($pdo, $email, $name);

    respond_json([
        'success' => true,
        'message' => 'Client créé avec succès',
    ], 201);
}

function editCustomer($pdo, $id): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond_error('Méthode non autorisée', 405, ['allowed' => ['POST']]);
    }

    $id = (int)$id;
    if ($id < 1) {
        respond_error('ID invalide', 400);
    }

    $input = parsed_body();
    $email = trim((string)($input['email'] ?? ''));
    $name  = trim((string)($input['name'] ?? ''));

    if ($email === '' || $name === '') {
        respond_error('Email et nom sont requis', 422);
    }

    updateCustomer($pdo, $id, $email, $name);

    respond_json([
        'success' => true,
        'message' => 'Client mis à jour',
    ]);
}

function removeCustomer($pdo, $id): void
{
    $id = (int)$id;
    if ($id < 1) {
        respond_error('ID invalide', 400);
    }

    $input = parsed_body();
    $deleteFlag = $input['delete'] ?? null;
    if (!$deleteFlag) {
        respond_error('Paramètre delete manquant', 400);
    }

    deleteCustomer($pdo, $id);

    respond_json([
        'success' => true,
        'message' => 'Client supprimé',
    ]);
}

function searchCustomer($pdo, $query): void
{
    $customers = globalSearch($pdo, $query);
    respond_json([
        'success' => true,
        'data' => $customers,
    ]);
}