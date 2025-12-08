<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/cart_helpers.php';
require_login_cliente();
$cid = (int)$_SESSION['cliente_id'];
$id_producto = (int)($_POST['id_producto'] ?? 0);
$cantidad = max(1, (int)($_POST['cantidad'] ?? 1));
$st = $pdo->prepare("SELECT precio_venta FROM PRODUCTO WHERE id_producto=? AND activo=1");
$st->execute([$id_producto]);
$p = $st->fetch();
if (!$p) { http_response_code(404); echo "NO_PRODUCTO"; exit; }
$id_carrito = cart_get_or_create($cid, $pdo);
$st = $pdo->prepare("SELECT id_item, cantidad FROM DETALLE_CARRITO WHERE id_carrito=? AND id_producto=?");
$st->execute([$id_carrito, $id_producto]);
if ($r = $st->fetch()) {
  $n = (int)$r['cantidad'] + $cantidad;
  $pdo->prepare("UPDATE DETALLE_CARRITO SET cantidad=? WHERE id_item=?")->execute([$n, (int)$r['id_item']]);
} else {
  $pdo->prepare("INSERT INTO DETALLE_CARRITO(id_carrito, id_producto, cantidad, precio_unitario) VALUES (?,?,?,?)")
      ->execute([$id_carrito, $id_producto, $cantidad, $p['precio_venta']]);
}
echo "OK";
