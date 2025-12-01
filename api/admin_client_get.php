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

$id_cliente = (int)($_GET['id'] ?? 0);

if ($id_cliente <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

try {
    // Obtener cliente
    $stmt = $pdo->prepare("
        SELECT 
            id_cliente,
            nombre,
            apellido,
            email,
            telefono,
            direccion,
            fecha_registro,
            estado
        FROM CLIENTE
        WHERE id_cliente = ?
    ");
    
    $stmt->execute([$id_cliente]);
    $cliente = $stmt->fetch();
    
    if (!$cliente) {
        http_response_code(404);
        echo json_encode(['error' => 'Cliente no encontrado']);
        exit;
    }
    
    // Obtener carrito activo
    $stmt = $pdo->prepare("
        SELECT 
            c.id_carrito,
            c.estado,
            c.fecha_creacion,
            COUNT(dc.id_item) as items,
            COALESCE(SUM(dc.cantidad * dc.precio_unitario), 0) as total
        FROM CARRITO c
        LEFT JOIN DETALLE_CARRITO dc ON dc.id_carrito = c.id_carrito
        WHERE c.id_cliente = ? AND c.estado = 'activo'
        GROUP BY c.id_carrito
        ORDER BY c.id_carrito DESC
        LIMIT 1
    ");
    
    $stmt->execute([$id_cliente]);
    $carrito = $stmt->fetch();
    
    // Obtener items del carrito si existe
    $items = [];
    if ($carrito && $carrito['id_carrito']) {
        $stmt = $pdo->prepare("
            SELECT 
                dc.id_item,
                dc.cantidad,
                dc.precio_unitario,
                p.nombre,
                p.imagen
            FROM DETALLE_CARRITO dc
            JOIN PRODUCTO p ON p.id_producto = dc.id_producto
            WHERE dc.id_carrito = ?
        ");
        
        $stmt->execute([$carrito['id_carrito']]);
        $items = $stmt->fetchAll();
    }
    
    echo json_encode([
        'cliente' => $cliente,
        'carrito' => $carrito,
        'items' => $items
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener cliente', 'details' => $e->getMessage()]);
}
