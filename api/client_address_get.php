<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

$cid = (int)$_SESSION['cliente_id'];

header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT direccion FROM CLIENTE WHERE id_cliente = :cid";
$st = $pdo->prepare($sql);
$st->execute([':cid' => $cid]);
$cliente = $st->fetch();

if (!$cliente) {
    http_response_code(404);
    echo json_encode(['error' => true, 'message' => 'Cliente no encontrado']);
    exit;
}

echo json_encode(['direccion' => $cliente['direccion']], JSON_UNESCAPED_UNICODE);
