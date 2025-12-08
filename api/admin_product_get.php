<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';

// Verificar sesión de admin o operador
check_admin_session();

$productoCrud = new \Spide\PUelperrito\Database\CrudProducto($pdo);
header('Content-Type: application/json; charset=utf-8');

$id = (int)($_GET['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

try {
    // Obtener producto
    $stmt = $pdo->prepare("
        SELECT
            p.*,
            COALESCE(i.stock, 0) as stock,
            COALESCE(i.stock_minimo, 0) as stock_minimo,
            u.nombre as creador_nombre,
            u.apellido as creador_apellido
        FROM producto p
        LEFT JOIN inventario i ON i.id_producto = p.id_producto
        LEFT JOIN usuario u ON u.id_usuario = p.id_usuario_creador
        WHERE p.id_producto = ?
    ");
    
    $stmt->execute([$id]);
    $producto = $stmt->fetch();
    
    if (!$producto) {
        http_response_code(404);
        echo json_encode(['error' => 'Producto no encontrado']);
        exit;
    }

    $producto['imagen'] = $productoCrud->normalizarRutaImagen($producto['imagen'] ?? null);
    
    // Obtener imágenes del producto
    $img_dir = dirname(__DIR__) . '/src/assets/' . $id . '_product';
    $imagenes = [];
    
    if (is_dir($img_dir)) {
        $files = scandir($img_dir);
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..' && preg_match('/\.(jpg|jpeg|png|gif)$/i', $file)) {
                $imagenes[] = $productoCrud->normalizarRutaImagen($id . '_product/' . $file);
            }
        }
    }
    
    echo json_encode([
        'producto' => $producto,
        'imagenes' => $imagenes
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener producto', 'details' => $e->getMessage()]);
}
