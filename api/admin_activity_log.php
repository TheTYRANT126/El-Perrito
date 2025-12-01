<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/logger.php';

// Solo admins pueden acceder al log general de actividades
require_login_admin();

if ($_SESSION['usuario_rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado. Solo administradores pueden ver el log completo.'], JSON_UNESCAPED_UNICODE);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

try {
    // Construir filtros desde los parámetros GET
    $filtros = [];

    // Filtro por usuario
    if (!empty($_GET['id_usuario'])) {
        $filtros['id_usuario'] = (int)$_GET['id_usuario'];
    }

    // Filtro por tipo de acción
    if (!empty($_GET['tipo_accion'])) {
        $filtros['tipo_accion'] = trim($_GET['tipo_accion']);
    }

    // Filtro por tabla afectada
    if (!empty($_GET['tabla_afectada'])) {
        $filtros['tabla_afectada'] = trim($_GET['tabla_afectada']);
    }

    // Filtro por rango de fechas
    if (!empty($_GET['fecha_inicio'])) {
        $filtros['fecha_inicio'] = trim($_GET['fecha_inicio']);
    }

    if (!empty($_GET['fecha_fin'])) {
        $filtros['fecha_fin'] = trim($_GET['fecha_fin']);
    }

    // Búsqueda en descripción
    if (!empty($_GET['search']) || !empty($_GET['q'])) {
        $filtros['search'] = trim($_GET['search'] ?? $_GET['q']);
    }

    // Paginación
    $filtros['page'] = max(1, (int)($_GET['page'] ?? 1));
    $filtros['per_page'] = min(100, max(10, (int)($_GET['per_page'] ?? 20)));

    // Obtener actividades filtradas
    $resultado = get_actividades_filtradas($filtros);

    echo json_encode([
        'success' => true,
        'data' => $resultado['actividades'],
        'pagination' => $resultado['pagination'],
        'filtros_aplicados' => $filtros
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log("Error en admin_activity_log: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener el log de actividades',
        'details' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
