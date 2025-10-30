<?php
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';

// Verificar sesión de admin o operador
check_admin_session();

header('Content-Type: application/json; charset=utf-8');

$page = max(1, (int)($_GET['page'] ?? 1));
$per_page = 20;
$offset = ($page - 1) * $per_page;
$search = trim($_GET['q'] ?? '');

try {
    // Construir query con búsqueda
    $where = "1=1";
    $params = [];
    
    if ($search !== '') {
        $where .= " AND (p.nombre LIKE ? OR p.id_producto = ?)";
        $params[] = '%' . $search . '%';
        $params[] = $search;
    }
    
    // Contar total de productos
    $count_stmt = $pdo->prepare("SELECT COUNT(*) as total FROM PRODUCTO p WHERE $where");
    $count_stmt->execute($params);
    $total = $count_stmt->fetch()['total'];
    
    // Obtener productos con paginación
    $sql = "
        SELECT 
            p.id_producto,
            p.nombre,
            p.precio_venta,
            p.imagen,
            p.activo,
            p.caducidad,
            p.fecha_creacion,
            COALESCE(i.stock, 0) as existencia,
            c.nombre as categoria,
            u.nombre as creador_nombre,
            u.apellido as creador_apellido
        FROM PRODUCTO p
        LEFT JOIN INVENTARIO i ON i.id_producto = p.id_producto
        LEFT JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
        LEFT JOIN USUARIO u ON u.id_usuario = p.id_usuario_creador
        WHERE $where
        ORDER BY p.id_producto DESC
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $per_page;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $productos = $stmt->fetchAll();

    // Normalizar las rutas de las imágenes
    foreach ($productos as &$producto) {
        if ($producto['imagen']) {
            // Si no tiene "images/" al inicio, agregarlo
            if (strpos($producto['imagen'], 'images/') !== 0) {
                $producto['imagen'] = 'images/' . $producto['imagen'];
            }
        } else {
            $producto['imagen'] = 'images/placeholder.png';
        }
    }
    unset($producto); // Romper la referencia

    echo json_encode([
        'productos' => $productos,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $per_page,
            'total' => $total,
            'total_pages' => ceil($total / $per_page)
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener productos', 'details' => $e->getMessage()]);
}
