<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');

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

/** ---------- Actions ---------- */

function respond_json($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function respond_error(string $message, int $status = 400, array $extra = []): void
{
    respond_json(['error' => $message] + $extra, $status);
}

/** Accepte JSON (application/json) ou formulaire (x-www-form-urlencoded/multipart) */
function parsed_body(): array
{
    $ctype = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($ctype, 'application/json') !== false) {
        $raw = file_get_contents('php://input') ?: '';
        $json = json_decode($raw, true);
        return is_array($json) ? $json : [];
    }
    return $_POST ?? [];
}
function s(string $v): string
{
    return trim($v);
}