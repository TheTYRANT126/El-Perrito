<?php
require_once __DIR__ . '/../lib/db.php';
header('Content-Type: application/json; charset=utf-8');
$id = (int)($_GET['id'] ?? 0);
$st = $pdo->prepare("SELECT p.id_producto, p.nombre, p.descripcion, p.precio_venta, p.imagen, c.nombre as categoria
                     FROM PRODUCTO p JOIN CATEGORIA c ON c.id_categoria=p.id_categoria
                     WHERE p.id_producto=:id AND p.activo=1");
$st->execute([':id'=>$id]);
$prod = $st->fetch();
if (!$prod) { http_response_code(404); echo json_encode(['error'=>'No encontrado']); exit; }
$im = $pdo->prepare("SELECT url FROM PRODUCTO_IMAGEN WHERE id_producto=:id ORDER BY prioridad ASC, id_imagen ASC");
$im->execute([':id'=>$id]);
$imgs = $im->fetchAll();
echo json_encode(['producto'=>$prod, 'imagenes'=>$imgs], JSON_UNESCAPED_UNICODE);
