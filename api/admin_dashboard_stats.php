<?php
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/db.php';

// Requiere autenticación como admin u operador
require_login_admin();

header('Content-Type: application/json; charset=utf-8');

try {
    $stats = [];

    // 1. Ventas del día actual
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total
        FROM venta
        WHERE DATE(fecha) = CURDATE()
    ");
    $stmt->execute();
    $stats['ventas_hoy'] = (float)$stmt->fetch()['total'];

    // 2. Ventas del mes actual
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total
        FROM venta
        WHERE YEAR(fecha) = YEAR(CURDATE())
        AND MONTH(fecha) = MONTH(CURDATE())
    ");
    $stmt->execute();
    $stats['ventas_mes'] = (float)$stmt->fetch()['total'];

    // 3. Ventas del mes anterior (para comparación)
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total
        FROM venta
        WHERE YEAR(fecha) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND MONTH(fecha) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
    ");
    $stmt->execute();
    $stats['ventas_mes_anterior'] = (float)$stmt->fetch()['total'];

    // 4. Calcular tendencia de ventas (porcentaje de cambio)
    if ($stats['ventas_mes_anterior'] > 0) {
        $cambio = (($stats['ventas_mes'] - $stats['ventas_mes_anterior']) / $stats['ventas_mes_anterior']) * 100;
        $stats['tendencia_ventas'] = round($cambio, 2);
    } else {
        $stats['tendencia_ventas'] = $stats['ventas_mes'] > 0 ? 100 : 0;
    }

    // 5. Total de productos activos
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM producto
        WHERE activo = 1
    ");
    $stmt->execute();
    $stats['productos_activos'] = (int)$stmt->fetch()['total'];

    // 6. Productos con stock bajo (stock < stock_minimo)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM inventario i
        INNER JOIN producto p ON p.id_producto = i.id_producto
        WHERE i.stock < i.stock_minimo
        AND p.activo = 1
    ");
    $stmt->execute();
    $stats['productos_stock_bajo'] = (int)$stmt->fetch()['total'];

    // 7. Productos agotados (stock = 0)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM inventario i
        INNER JOIN producto p ON p.id_producto = i.id_producto
        WHERE i.stock = 0
        AND p.activo = 1
    ");
    $stmt->execute();
    $stats['productos_agotados'] = (int)$stmt->fetch()['total'];

    // 8. Total de clientes registrados
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM cliente
        WHERE estado = 'activo'
    ");
    $stmt->execute();
    $stats['total_clientes'] = (int)$stmt->fetch()['total'];

    // 9. Clientes nuevos este mes
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM cliente
        WHERE YEAR(fecha_registro) = YEAR(CURDATE())
        AND MONTH(fecha_registro) = MONTH(CURDATE())
        AND estado = 'activo'
    ");
    $stmt->execute();
    $stats['clientes_nuevos_mes'] = (int)$stmt->fetch()['total'];

    // 10. Clientes nuevos mes anterior (para comparación)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM cliente
        WHERE YEAR(fecha_registro) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND MONTH(fecha_registro) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND estado = 'activo'
    ");
    $stmt->execute();
    $stats['clientes_nuevos_mes_anterior'] = (int)$stmt->fetch()['total'];

    // 11. Calcular tendencia de clientes nuevos
    if ($stats['clientes_nuevos_mes_anterior'] > 0) {
        $cambio = (($stats['clientes_nuevos_mes'] - $stats['clientes_nuevos_mes_anterior']) / $stats['clientes_nuevos_mes_anterior']) * 100;
        $stats['tendencia_clientes'] = round($cambio, 2);
    } else {
        $stats['tendencia_clientes'] = $stats['clientes_nuevos_mes'] > 0 ? 100 : 0;
    }

    // 12. Top 5 productos más vendidos del mes
    $stmt = $pdo->prepare("
        SELECT
            p.id_producto,
            p.nombre,
            p.imagen,
            SUM(dv.cantidad) as total_vendido,
            SUM(dv.cantidad * dv.precio_unitario) as ingresos
        FROM detalle_venta dv
        INNER JOIN venta v ON v.id_venta = dv.id_venta
        INNER JOIN producto p ON p.id_producto = dv.id_producto
        WHERE YEAR(v.fecha) = YEAR(CURDATE())
        AND MONTH(v.fecha) = MONTH(CURDATE())
        GROUP BY p.id_producto, p.nombre, p.imagen
        ORDER BY total_vendido DESC
        LIMIT 5
    ");
    $stmt->execute();
    $stats['top_productos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 13. Últimas 10 actividades del sistema
    $stmt = $pdo->prepare("
        SELECT
            ra.id_registro,
            ra.tipo_accion,
            ra.tabla_afectada,
            ra.id_registro_afectado,
            ra.descripcion,
            ra.fecha_accion,
            u.nombre as usuario_nombre,
            u.apellido as usuario_apellido,
            u.rol as usuario_rol
        FROM registro_actividad ra
        INNER JOIN usuario u ON u.id_usuario = ra.id_usuario
        ORDER BY ra.fecha_accion DESC
        LIMIT 10
    ");
    $stmt->execute();
    $stats['actividades_recientes'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 14. Total de ventas (histórico)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM venta
    ");
    $stmt->execute();
    $stats['total_ventas'] = (int)$stmt->fetch()['total'];

    // 15. Ventas de hoy (cantidad de órdenes)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM venta
        WHERE DATE(fecha) = CURDATE()
    ");
    $stmt->execute();
    $stats['ordenes_hoy'] = (int)$stmt->fetch()['total'];

    // 16. Ventas del mes (cantidad de órdenes)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM venta
        WHERE YEAR(fecha) = YEAR(CURDATE())
        AND MONTH(fecha) = MONTH(CURDATE())
    ");
    $stmt->execute();
    $stats['ordenes_mes'] = (int)$stmt->fetch()['total'];

    echo json_encode([
        'success' => true,
        'stats' => $stats
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log("Error en admin_dashboard_stats: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener estadísticas',
        'details' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
