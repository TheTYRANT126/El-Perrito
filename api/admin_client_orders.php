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
    // Obtener ventas del cliente
    $stmt = $pdo->prepare("
        SELECT
            v.id_venta,
            v.fecha,
            v.total,
            v.estado_pago,
            v.direccion_envio,
            COUNT(dv.id_detalle) as items
        FROM venta v
        LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
        WHERE v.id_cliente = ?
        GROUP BY v.id_venta
        ORDER BY v.fecha DESC
    ");
    
    $stmt->execute([$id_cliente]);
    $ventas = $stmt->fetchAll();
    
    // Para cada venta, obtener los detalles
    foreach ($ventas as &$venta) {
        $stmt = $pdo->prepare("
            SELECT
                dv.cantidad,
                dv.precio_unitario,
                p.nombre
            FROM detalle_venta dv
            JOIN producto p ON p.id_producto = dv.id_producto
            WHERE dv.id_venta = ?
        ");
        
        $stmt->execute([$venta['id_venta']]);
        $venta['detalles'] = $stmt->fetchAll();
    }
    
    echo json_encode(['ventas' => $ventas], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener historial', 'details' => $e->getMessage()]);
}
