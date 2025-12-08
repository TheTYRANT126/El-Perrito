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
$id_direccion = isset($_POST['id_direccion']) ? (int)$_POST['id_direccion'] : 0;

if (!$id_direccion) {
    http_response_code(400);
    echo 'ID de dirección no proporcionado';
    exit;
}

// Verificar que la dirección pertenece al cliente
$st = $pdo->prepare("SELECT id_direccion FROM direccion_envio WHERE id_direccion = ? AND id_cliente = ?");
$st->execute([$id_direccion, $cid]);
if (!$st->fetch()) {
    http_response_code(404);
    echo 'Dirección no encontrada';
    exit;
}

try {
    $sql = "DELETE FROM direccion_envio WHERE id_direccion = ? AND id_cliente = ?";
    $st = $pdo->prepare($sql);
    $st->execute([$id_direccion, $cid]);

    echo 'OK';

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error al eliminar la dirección';
}
