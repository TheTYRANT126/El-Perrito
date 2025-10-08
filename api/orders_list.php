<?php
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();
$cid = (int)$_SESSION['cliente_id'];
header('Content-Type: application/json; charset=utf-8');
$sql = "SELECT v.id_venta, v.fecha, v.total,
               GROUP_CONCAT(CONCAT(d.cantidad,'x ',p.nombre) SEPARATOR ', ') AS resumen
        FROM VENTA v
        JOIN DETALLE_VENTA d ON d.id_venta=v.id_venta
        JOIN PRODUCTO p ON p.id_producto=d.id_producto
        WHERE v.id_cliente=:c
        GROUP BY v.id_venta, v.fecha, v.total
        ORDER BY v.fecha DESC";
$st = $pdo->prepare($sql);
$st->execute([':c'=>$cid]);
echo json_encode($st->fetchAll(), JSON_UNESCAPED_UNICODE);
