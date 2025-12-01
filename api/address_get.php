<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

$cid = (int)$_SESSION['cliente_id'];
$id_direccion = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id_direccion) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => true, 'message' => 'ID de dirección no proporcionado']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT id_direccion, nombre_completo, telefono, calle, numero_exterior, numero_interior,
               colonia, ciudad, estado, codigo_postal, referencias, es_predeterminada
        FROM direccion_envio
        WHERE id_direccion = :id AND id_cliente = :cid";

$st = $pdo->prepare($sql);
$st->execute([':id' => $id_direccion, ':cid' => $cid]);
$direccion = $st->fetch();

if (!$direccion) {
    http_response_code(404);
    echo json_encode(['error' => true, 'message' => 'Dirección no encontrada']);
    exit;
}

echo json_encode($direccion, JSON_UNESCAPED_UNICODE);
