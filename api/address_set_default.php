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
    $pdo->beginTransaction();

    // Quitar marca de predeterminada de todas las direcciones
    $pdo->prepare("UPDATE direccion_envio SET es_predeterminada = 0 WHERE id_cliente = ?")
        ->execute([$cid]);

    // Marcar la dirección seleccionada como predeterminada
    $pdo->prepare("UPDATE direccion_envio SET es_predeterminada = 1 WHERE id_direccion = ?")
        ->execute([$id_direccion]);

    $pdo->commit();
    echo 'OK';

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo 'Error al marcar como predeterminada';
}
