<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Método no permitido';
    exit;
}

$cid = (int)$_SESSION['cliente_id'];
$direccion = isset($_POST['direccion']) ? trim($_POST['direccion']) : '';

if (empty($direccion)) {
    http_response_code(400);
    echo 'La dirección no puede estar vacía';
    exit;
}

// Actualizar dirección del cliente
$sql = "UPDATE cliente SET direccion = :direccion WHERE id_cliente = :cid";
$st = $pdo->prepare($sql);

try {
    $st->execute([':direccion' => $direccion, ':cid' => $cid]);
    echo 'OK';
} catch (Exception $e) {
    http_response_code(500);
    echo 'Error al actualizar la dirección';
}
