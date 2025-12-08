<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/logger.php';
require_login_admin();

header('Content-Type: text/plain; charset=utf-8');

$id_producto = (int)($_POST['id_producto'] ?? 0);

if ($id_producto <= 0) {
    http_response_code(400);
    echo 'ID inválido';
    exit;
}

try {
    // Obtener nombre del producto para el log
    $stmt = $pdo->prepare("SELECT nombre FROM PRODUCTO WHERE id_producto = ?");
    $stmt->execute([$id_producto]);
    $producto = $stmt->fetch();
    
    if (!$producto) {
        http_response_code(404);
        echo 'Producto no encontrado';
        exit;
    }
    
    // Soft delete - marcar como inactivo
    $stmt = $pdo->prepare("UPDATE PRODUCTO SET activo = 0 WHERE id_producto = ?");
    $stmt->execute([$id_producto]);
    
    // Registrar actividad
    log_actividad(
        $_SESSION['usuario_id'],
        'eliminar',
        'PRODUCTO',
        $id_producto,
        "Marcó como inactivo el producto '{$producto['nombre']}' (ID: $id_producto)"
    );
    
    echo 'OK';
    
} catch (Exception $e) {
    http_response_code(500);
    echo 'Error al eliminar producto: ' . $e->getMessage();
}
