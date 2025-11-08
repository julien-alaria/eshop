<?php

// error_reporting(E_ALL);
// ini_set('display_errors', '1');

/** CORS + JSON pour toutes les réponses */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

/** Préflight CORS */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/** ---------- Helpers ---------- */

function respond_json(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function respond_error(string $message, int $status = 400, array $extra = []): void
{
    respond_json(array_merge([
        'success' => false,
        'message' => $message,
    ], $extra), $status);
}

function parsed_body(): array
{
    $input = [];
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($contentType, 'application/json')) {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
    } else {
        $input = $_POST ?? [];
    }
    return $input;
}

function s(string $v): string
{
    return trim($v);
}