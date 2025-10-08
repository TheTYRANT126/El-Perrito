<?php
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_admin();

$id_producto = (int)($_POST['id_producto'] ?? 0);
$stock = (int)($_POST['stock'] ?? 0);
$min = (int)($_POST['stock_minimo'] ?? 0);

try {
  $pdo->beginTransaction();
  $st = $pdo->prepare("SELECT 1 FROM INVENTARIO WHERE id_producto=:p FOR UPDATE");
  $st->execute([':p'=>$id_producto]);
  if ($st->fetch()) {
    $pdo->prepare("UPDATE INVENTARIO SET stock=:s, stock_minimo=:m WHERE id_producto=:p")
        ->execute([':s'=>$stock, ':m'=>$min, ':p'=>$id_producto]);
  } else {
    $pdo->prepare("INSERT INTO INVENTARIO (id_producto,stock,stock_minimo) VALUES (:p,:s,:m)")
        ->execute([':p'=>$id_producto, ':s'=>$stock, ':m'=>$min]);
  }
  $pdo->commit(); echo 'OK';
} catch (Throwable $e) { $pdo->rollBack(); http_response_code(500); echo 'Error'; }
