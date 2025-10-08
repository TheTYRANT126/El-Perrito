<?php
require_once __DIR__ . '/../lib/db.php';
header('Content-Type: application/json; charset=utf-8');
$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$cat = isset($_GET['cat']) ? (int)$_GET['cat'] : 0;
$sql = "SELECT id_producto, nombre, precio_venta, imagen FROM PRODUCTO WHERE activo=1";
$params = [];
if ($cat>0) { $sql .= " AND id_categoria=?"; $params[]=$cat; }
if ($q !== '') { $sql .= " AND nombre LIKE ?"; $params[]='%'.$q.'%'; }
$sql .= " ORDER BY nombre";
$st = $pdo->prepare($sql);
$st->execute($params);
$out = [];
while ($r = $st->fetch()) {
  $out[] = [
    'id_producto' => (int)$r['id_producto'],
    'nombre' => $r['nombre'],
    'precio_venta' => (float)$r['precio_venta'],
    'imagen' => $r['imagen'] ?: 'images/placeholder.png'
  ];
}
echo json_encode($out, JSON_UNESCAPED_UNICODE);
