<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

$cid = (int)$_SESSION['cliente_id'];

header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT id_tarjeta, tipo_tarjeta, numero_tarjeta, cvv, nombre_titular,
               mes_expiracion, anio_expiracion, es_predeterminada, fecha_creacion
        FROM tarjeta
        WHERE id_cliente = :cid AND activa = 1
        ORDER BY es_predeterminada DESC, fecha_creacion DESC";

$st = $pdo->prepare($sql);
$st->execute([':cid' => $cid]);
$tarjetas = $st->fetchAll();

echo json_encode($tarjetas, JSON_UNESCAPED_UNICODE);
