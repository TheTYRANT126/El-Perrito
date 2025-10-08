<?php
require_once __DIR__ . '/../lib/db.php';
header('Content-Type: application/json; charset=utf-8');
$st = $pdo->query("SELECT id_categoria, nombre FROM CATEGORIA WHERE activa=1 ORDER BY nombre");
echo json_encode($st->fetchAll(), JSON_UNESCAPED_UNICODE);
