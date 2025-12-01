<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use Spide\PUelperrito\Database\CrudProducto;

header('Content-Type: application/json; charset=utf-8');

try {
    $crud = new CrudProducto($pdo);
    $filters = [
        'q' => isset($_GET['q']) ? trim((string) $_GET['q']) : '',
        'categoria' => isset($_GET['cat']) ? (int) $_GET['cat'] : null,
    ];

    $productos = $crud->listar($filters);
    echo json_encode($productos, JSON_UNESCAPED_UNICODE);
} catch (\Throwable $e) {
    error_log('Error en products_list: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'No se pudieron recuperar los productos.',
    ]);
}
