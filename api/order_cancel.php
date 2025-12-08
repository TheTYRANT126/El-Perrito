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
$id_venta = isset($_POST['id_venta']) ? (int)$_POST['id_venta'] : 0;

if (!$id_venta) {
    http_response_code(400);
    echo 'ID de venta no proporcionado';
    exit;
}

// Verificar que la venta pertenece al cliente y obtener su estado
$sql = "SELECT estado_envio FROM venta WHERE id_venta = :id AND id_cliente = :cid";
$st = $pdo->prepare($sql);
$st->execute([':id' => $id_venta, ':cid' => $cid]);
$venta = $st->fetch();

if (!$venta) {
    http_response_code(404);
    echo 'Venta no encontrada';
    exit;
}

// Validar que el pedido no ha sido enviado
if ($venta['estado_envio'] === 'enviado' || $venta['estado_envio'] === 'entregado') {
    http_response_code(400);
    echo 'No se puede cancelar un pedido que ya ha sido enviado o entregado';
    exit;
}

// Validar que el pedido no esté ya cancelado
if ($venta['estado_envio'] === 'cancelado') {
    http_response_code(400);
    echo 'El pedido ya está cancelado';
    exit;
}

// Actualizar estado del pedido a cancelado
$sql_update = "UPDATE venta SET estado_envio = 'cancelado' WHERE id_venta = :id";
$st_update = $pdo->prepare($sql_update);

try {
    $st_update->execute([':id' => $id_venta]);
    echo 'OK';
} catch (Exception $e) {
    http_response_code(500);
    echo 'Error al cancelar el pedido';
}
