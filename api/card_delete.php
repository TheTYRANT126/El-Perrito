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

if (empty($_POST['id_tarjeta'])) {
    http_response_code(400);
    echo 'ID de tarjeta requerido';
    exit;
}

$id_tarjeta = (int)$_POST['id_tarjeta'];

// Verificar que la tarjeta pertenece al cliente
$sql_check = "SELECT es_predeterminada FROM tarjeta WHERE id_tarjeta = ? AND id_cliente = ? AND activa = 1";
$st_check = $pdo->prepare($sql_check);
$st_check->execute([$id_tarjeta, $cid]);
$tarjeta = $st_check->fetch();

if (!$tarjeta) {
    http_response_code(404);
    echo 'Tarjeta no encontrada';
    exit;
}

try {
    $pdo->beginTransaction();

    // Soft delete: marcar como inactiva
    $sql = "UPDATE tarjeta SET activa = 0, es_predeterminada = 0 WHERE id_tarjeta = ? AND id_cliente = ?";
    $st = $pdo->prepare($sql);
    $st->execute([$id_tarjeta, $cid]);

    // Si era predeterminada, marcar otra como predeterminada
    if ($tarjeta['es_predeterminada'] == 1) {
        $sql_new_default = "UPDATE tarjeta SET es_predeterminada = 1
                           WHERE id_cliente = ? AND activa = 1
                           ORDER BY fecha_creacion DESC LIMIT 1";
        $pdo->prepare($sql_new_default)->execute([$cid]);
    }

    $pdo->commit();

    echo 'OK';

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo 'Error al eliminar la tarjeta';
}
