<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

$cid = (int)$_SESSION['cliente_id'];

if (empty($_GET['id'])) {
    http_response_code(400);
    echo 'ID de tarjeta requerido';
    exit;
}

$id_tarjeta = (int)$_GET['id'];

header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT id_tarjeta, tipo_tarjeta, numero_tarjeta, cvv, nombre_titular,
               mes_expiracion, anio_expiracion, es_predeterminada
        FROM tarjeta
        WHERE id_tarjeta = ? AND id_cliente = ? AND activa = 1";

$st = $pdo->prepare($sql);
$st->execute([$id_tarjeta, $cid]);
$tarjeta = $st->fetch();

if (!$tarjeta) {
    http_response_code(404);
    echo json_encode(['error' => 'Tarjeta no encontrada']);
    exit;
}

echo json_encode($tarjeta, JSON_UNESCAPED_UNICODE);
