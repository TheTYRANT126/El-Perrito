<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use Spide\PUelperrito\Database\CrudProducto;

header('Content-Type: application/json; charset=utf-8');

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

try {
    $crud = new CrudProducto($pdo);
    $detalle = $crud->obtenerDetalle($id);
    echo json_encode($detalle, JSON_UNESCAPED_UNICODE);
} catch (\RuntimeException $exception) {
    http_response_code(404);
    echo json_encode(['error' => $exception->getMessage()]);
} catch (\Throwable $e) {
    error_log('Error en product_detail: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno']);
}
