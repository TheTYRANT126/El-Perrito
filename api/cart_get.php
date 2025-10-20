<?php
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/cart_helpers.php'; 
require_login_cliente();

$cid = (int)$_SESSION['cliente_id'];
$id_carrito = cart_get_or_create($cid, $pdo);

// para que la consulta no falle por falta de imagenes
$sql = "SELECT i.id_item, i.id_producto, i.cantidad, i.precio_unitario, p.nombre, COALESCE(p.imagen, '') as imagen
        FROM DETALLE_CARRITO i
        JOIN PRODUCTO p ON p.id_producto=i.id_producto
        WHERE i.id_carrito=?";
$st = $pdo->prepare($sql);
$st->execute([$id_carrito]);
$items = $st->fetchAll();

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['id_carrito'=>$id_carrito, 'items'=>$items], JSON_UNESCAPED_UNICODE);