<?php
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_admin();

// Solo admins pueden acceder a esta funcionalidad
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
    // Construir query con búsqueda y filtros
    $where = "1=1";
    $params = [];

    // Búsqueda por nombre, apellido o email
    if ($search !== '') {
        $where .= " AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)";
        $search_param = '%' . $search . '%';
        $params[] = $search_param;
        $params[] = $search_param;
        $params[] = $search_param;
    }

    // Filtro por rol (admin u operador)
    if (!empty($_GET['rol']) && in_array($_GET['rol'], ['admin', 'operador'])) {
        $where .= " AND rol = ?";
        $params[] = $_GET['rol'];
    }

    // Filtro por estado activo/inactivo
    if (isset($_GET['activo']) && $_GET['activo'] !== '') {
        $where .= " AND activo = ?";
        $params[] = (int)$_GET['activo'];
    }
    
    // Contar total de usuarios
    $count_stmt = $pdo->prepare("SELECT COUNT(*) as total FROM USUARIO WHERE $where");
    $count_stmt->execute($params);
    $total = $count_stmt->fetch()['total'];
    
    // Obtener usuarios con paginación
    $sql = "
        SELECT 
            id_usuario,
            nombre,
            apellido,
            email,
            rol,
            activo,
            fecha_registro,
            fecha_ultima_modificacion
        FROM USUARIO
        WHERE $where
        ORDER BY id_usuario DESC
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $per_page;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $usuarios = $stmt->fetchAll();
    
    echo json_encode([
        'usuarios' => $usuarios,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $per_page,
            'total' => $total,
            'total_pages' => ceil($total / $per_page)
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener usuarios', 'details' => $e->getMessage()]);
}
