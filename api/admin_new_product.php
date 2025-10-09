<?php
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_admin();

$nombre = trim($_POST['nombre'] ?? '');
$id_categoria = (int)($_POST['id_categoria'] ?? 0);
$precio = (float)($_POST['precio_venta'] ?? 0);
$imagen = trim($_POST['imagen'] ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');
$es_medicamento = (int)($_POST['es_medicamento'] ?? 0);

if (!$nombre || $id_categoria<=0 || $precio<=0) { http_response_code(400); echo 'Datos inválidos'; exit; }

try {
  $pdo->beginTransaction();
  $pdo->prepare("INSERT INTO PRODUCTO (id_categoria,nombre,descripcion,precio_venta,imagen,es_medicamento,activo)
                 VALUES (:c,:n,:d,:p,:i,:m,1)")
      ->execute([':c'=>$id_categoria, ':n'=>$nombre, ':d'=>$descripcion, ':p'=>$precio, ':i'=>$imagen, ':m'=>$es_medicamento]);
  $idp = $pdo->lastInsertId();
  $pdo->prepare("INSERT INTO INVENTARIO (id_producto,stock,stock_minimo) VALUES (:p,0,0)")
      ->execute([':p'=>$idp]);
  $pdo->commit(); echo 'OK';
} catch (Throwable $e) { $pdo->rollBack(); http_response_code(500); echo 'Error'; }
