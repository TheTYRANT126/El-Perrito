<?php

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_admin();

header('Content-Type: application/json; charset=utf-8');

$usuario_id = (int)$_SESSION['usuario_id'];

try {
    $st = $pdo->prepare("SELECT id_usuario, nombre, apellido, email, telefono, direccion, rol FROM usuario WHERE id_usuario = ?");
    $st->execute([$usuario_id]);
    $usuario = $st->fetch();
    
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }
    
    echo json_encode($usuario, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
