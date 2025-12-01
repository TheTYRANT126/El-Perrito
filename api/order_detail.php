<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

$cid = (int)$_SESSION['cliente_id'];
$id_venta = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id_venta) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => true, 'message' => 'ID de venta no proporcionado']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Obtener información de la venta
$sql = "SELECT v.id_venta, v.fecha, v.total, v.estado_pago, v.estado_envio, v.direccion_envio
        FROM VENTA v
        WHERE v.id_venta = :id AND v.id_cliente = :cid";
$st = $pdo->prepare($sql);
$st->execute([':id' => $id_venta, ':cid' => $cid]);
$venta = $st->fetch();

if (!$venta) {
    http_response_code(404);
    echo json_encode(['error' => true, 'message' => 'Venta no encontrada']);
    exit;
}

// Obtener detalles de productos de la venta
$sql_detalle = "SELECT d.id_producto, d.cantidad, d.precio_unitario,
                       p.nombre, p.imagen,
                       (d.cantidad * d.precio_unitario) AS subtotal
                FROM DETALLE_VENTA d
                JOIN PRODUCTO p ON p.id_producto = d.id_producto
                WHERE d.id_venta = :id
                ORDER BY d.id_detalle";
$st_detalle = $pdo->prepare($sql_detalle);
$st_detalle->execute([':id' => $id_venta]);
$items = $st_detalle->fetchAll();

// Combinar información
$resultado = [
    'venta' => $venta,
    'items' => $items
];

echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
