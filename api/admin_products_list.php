<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';

// Verificar sesión de admin o operador
check_admin_session();

$productoCrud = new \Spide\PUelperrito\Database\CrudProducto($pdo);
header('Content-Type: application/json; charset=utf-8');

$page = max(1, (int)($_GET['page'] ?? 1));
$per_page = 20;
$offset = ($page - 1) * $per_page;
$search = trim($_GET['q'] ?? '');

try {
    // Construir query con búsqueda y filtros
    $where = "1=1";
    $params = [];

    // Búsqueda por nombre o ID
    if ($search !== '') {
        $where .= " AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.id_producto = ?)";
        $params[] = '%' . $search . '%';
        $params[] = '%' . $search . '%';
        $params[] = $search;
    }

    // Filtro por categoría
    if (!empty($_GET['categoria'])) {
        $where .= " AND p.id_categoria = ?";
        $params[] = (int)$_GET['categoria'];
    }

    // Filtro por estado activo/inactivo
    if (isset($_GET['activo']) && $_GET['activo'] !== '') {
        $where .= " AND p.activo = ?";
        $params[] = (int)$_GET['activo'];
    }

    // Filtro por rango de precio
    if (!empty($_GET['precio_min'])) {
        $where .= " AND p.precio_venta >= ?";
        $params[] = (float)$_GET['precio_min'];
    }

    if (!empty($_GET['precio_max'])) {
        $where .= " AND p.precio_venta <= ?";
        $params[] = (float)$_GET['precio_max'];
    }

    // Filtro por stock bajo
    if (!empty($_GET['stock_bajo']) && $_GET['stock_bajo'] == '1') {
        $where .= " AND i.stock < i.stock_minimo AND i.stock_minimo > 0";
    }

    // Filtro por productos agotados
    if (!empty($_GET['agotado']) && $_GET['agotado'] == '1') {
        $where .= " AND i.stock = 0";
    }
    
    // Contar total de productos (necesita JOIN con inventario si se filtran por stock)
    $count_sql = "
        SELECT COUNT(*) as total
        FROM PRODUCTO p
        LEFT JOIN INVENTARIO i ON i.id_producto = p.id_producto
        WHERE $where
    ";
    $count_stmt = $pdo->prepare($count_sql);
    $count_stmt->execute($params);
    $total = $count_stmt->fetch()['total'];
    
    // Obtener productos con paginación
    $sql = "
        SELECT
            p.id_producto,
            p.nombre,
            p.descripcion,
            p.precio_venta,
            p.imagen,
            p.activo,
            p.caducidad,
            p.es_medicamento,
            p.fecha_creacion,
            p.id_categoria,
            COALESCE(i.stock, 0) as existencia,
            COALESCE(i.stock_minimo, 0) as stock_minimo,
            CASE
                WHEN COALESCE(i.stock, 0) = 0 THEN 'agotado'
                WHEN COALESCE(i.stock, 0) < COALESCE(i.stock_minimo, 0) AND i.stock_minimo > 0 THEN 'bajo'
                ELSE 'normal'
            END as estado_stock,
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
        $producto['imagen'] = $productoCrud->normalizarRutaImagen($producto['imagen'] ?? null);
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
