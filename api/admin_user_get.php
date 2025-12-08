<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_admin();

// Solo admins pueden acceder
if ($_SESSION['usuario_rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$id = (int)($_GET['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

try {
    // Obtener usuario
    $stmt = $pdo->prepare("
        SELECT
            id_usuario,
            nombre,
            apellido,
            email,
            curp,
            fecha_nacimiento,
            direccion,
            telefono,
            rol,
            activo,
            fecha_registro,
            fecha_ultima_modificacion
        FROM usuario
        WHERE id_usuario = ?
    ");
    
    $stmt->execute([$id]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }
    
    // No enviar datos sensibles
    echo json_encode(['usuario' => $usuario], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener usuario', 'details' => $e->getMessage()]);
}
