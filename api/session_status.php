<?php
require_once __DIR__ . '/../lib/session.php';
header('Content-Type: application/json; charset=utf-8');
if (isset($_SESSION['cliente_id'])) echo json_encode(['status'=>'cliente']);
else if (isset($_SESSION['usuario_id'])) echo json_encode(['status'=>'admin']);
else echo json_encode(['status'=>'anon']);
