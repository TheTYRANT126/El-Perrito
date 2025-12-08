<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();
$id_item = (int)($_POST['id_item'] ?? 0);
$cantidad = (int)($_POST['cantidad'] ?? 0);
if ($cantidad <= 0) {
  $pdo->prepare("DELETE FROM detalle_carrito WHERE id_item=?")->execute([$id_item]);
} else {
  $pdo->prepare("UPDATE detalle_carrito SET cantidad=? WHERE id_item=?")->execute([$cantidad, $id_item]);
}
echo "OK";
