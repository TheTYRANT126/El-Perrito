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

$page = max(1, (int)($_GET['page'] ?? 1));
$per_page = 20;
$offset = ($page - 1) * $per_page;
$search = trim($_GET['q'] ?? '');

try {
    // Construir query con búsqueda
    $where = "1=1";
    $params = [];
    
    if ($search !== '') {
        $where .= " AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)";
        $search_param = '%' . $search . '%';
        $params[] = $search_param;
        $params[] = $search_param;
        $params[] = $search_param;
    }
    
    // Contar total de clientes
    $count_stmt = $pdo->prepare("SELECT COUNT(*) as total FROM CLIENTE WHERE $where");
    $count_stmt->execute($params);
    $total = $count_stmt->fetch()['total'];
    
    // Obtener clientes con paginación
    $sql = "
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
        WHERE $where
        ORDER BY id_cliente DESC
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $per_page;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $clientes = $stmt->fetchAll();
    
    echo json_encode([
        'clientes' => $clientes,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $per_page,
            'total' => $total,
            'total_pages' => ceil($total / $per_page)
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener clientes', 'details' => $e->getMessage()]);
}
