<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/session.php';
function cart_get_or_create($cliente_id, $pdo){
  $st = $pdo->prepare("SELECT id_carrito FROM carrito WHERE id_cliente=? AND estado='activo' ORDER BY id_carrito DESC LIMIT 1");
  $st->execute([$cliente_id]);
  if ($r = $st->fetch()) return (int)$r['id_carrito'];
  $st = $pdo->prepare("INSERT INTO carrito(id_cliente, estado) VALUES(?, 'activo')");
  $st->execute([$cliente_id]);
  return (int)$pdo->lastInsertId();
}
