<?php

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

header('Content-Type: application/json; charset=utf-8');

$cliente_id = (int)$_SESSION['cliente_id'];

try {
    $st = $pdo->prepare("SELECT id_cliente, nombre, apellido, email, telefono, direccion FROM CLIENTE WHERE id_cliente = ?");
    $st->execute([$cliente_id]);
    $cliente = $st->fetch();
    
    if (!$cliente) {
        http_response_code(404);
        echo json_encode(['error' => 'Cliente no encontrado']);
        exit;
    }
    
    echo json_encode($cliente, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}