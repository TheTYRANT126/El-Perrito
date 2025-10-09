<?php
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/cart_helpers.php';
require_login_cliente();
$cid = (int)$_SESSION['cliente_id'];

$st = $pdo->prepare("SELECT id_carrito FROM CARRITO WHERE id_cliente=? AND estado='activo' ORDER BY id_carrito DESC LIMIT 1");
$st->execute([$cid]);
if (!($r = $st->fetch())) { http_response_code(400); echo "CARRITO_VACIO"; exit; }
$id_carrito = (int)$r['id_carrito'];

$pdo->beginTransaction();
try {
  $items = $pdo->prepare("SELECT id_producto, cantidad, precio_unitario FROM DETALLE_CARRITO WHERE id_carrito=?");
  $items->execute([$id_carrito]);
  $list = $items->fetchAll();
  if (!$list) throw new Exception('CARRITO_VACIO');

  $total = 0; foreach ($list as $it) $total += $it['precio_unitario']*$it['cantidad'];
  $pdo->prepare("INSERT INTO VENTA(id_cliente, total, estado_pago) VALUES (?, ?, 'pagado')")->execute([$cid, $total]);
  $id_venta = (int)$pdo->lastInsertId();

  $insD = $pdo->prepare("INSERT INTO DETALLE_VENTA(id_venta, id_producto, cantidad, precio_unitario) VALUES (?,?,?,?)");
  foreach ($list as $it) { $insD->execute([$id_venta, $it['id_producto'], $it['cantidad'], $it['precio_unitario']]); }

  $pdo->prepare("UPDATE CARRITO SET estado='cerrado' WHERE id_carrito=?")->execute([$id_carrito]);

  $pdo->commit();
  echo "OK";
} catch(Throwable $e) {
  $pdo->rollBack();
  http_response_code(500);
  echo "ERROR";
}
