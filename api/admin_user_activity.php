<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/logger.php';
require_login_admin();

// Solo admins pueden acceder
if ($_SESSION['usuario_rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$id_usuario = (int)($_GET['id'] ?? 0);

if ($id_usuario <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

try {
    $actividades = get_usuario_actividades($id_usuario, 100);
    
    echo json_encode(['actividades' => $actividades], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener actividades', 'details' => $e->getMessage()]);
}
