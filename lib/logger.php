<?php
// lib/logger.php - Funciones para registrar actividades y cambios

require_once __DIR__ . '/db.php';

/**
 * Registra una actividad en el sistema
 */
function log_actividad($id_usuario, $tipo_accion, $tabla_afectada, $id_registro_afectado, $descripcion) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO registro_actividad 
            (id_usuario, tipo_accion, tabla_afectada, id_registro_afectado, descripcion) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id_usuario,
            $tipo_accion,
            $tabla_afectada,
            $id_registro_afectado,
            $descripcion
        ]);
        
        return true;
    } catch (Exception $e) {
        error_log("Error al registrar actividad: " . $e->getMessage());
        return false;
    }
}

/**
 * Registra un cambio en el historial de un usuario
 */
function log_usuario_cambio($id_usuario, $campo_modificado, $valor_anterior, $valor_nuevo, $id_usuario_modificador) {
    global $pdo;
    
    try {
        // Solo registrar si hay un cambio real
        if ($valor_anterior != $valor_nuevo) {
            $stmt = $pdo->prepare("
                INSERT INTO historial_usuario 
                (id_usuario, campo_modificado, valor_anterior, valor_nuevo, id_usuario_modificador) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $id_usuario,
                $campo_modificado,
                $valor_anterior,
                $valor_nuevo,
                $id_usuario_modificador
            ]);
        }
        
        return true;
    } catch (Exception $e) {
        error_log("Error al registrar cambio de usuario: " . $e->getMessage());
        return false;
    }
}

/**
 * Obtiene el historial de cambios de un usuario
 */
function get_usuario_historial($id_usuario, $limit = 50) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                h.*,
                u.nombre as modificador_nombre,
                u.apellido as modificador_apellido
            FROM historial_usuario h
            LEFT JOIN usuario u ON u.id_usuario = h.id_usuario_modificador
            WHERE h.id_usuario = ?
            ORDER BY h.fecha_cambio DESC
            LIMIT ?
        ");
        
        $stmt->execute([$id_usuario, $limit]);
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("Error al obtener historial: " . $e->getMessage());
        return [];
    }
}

/**
 * Obtiene el registro de actividades de un usuario
 */
function get_usuario_actividades($id_usuario, $limit = 50) {
    global $pdo;

    try {
        $stmt = $pdo->prepare("
            SELECT *
            FROM registro_actividad
            WHERE id_usuario = ?
            ORDER BY fecha_accion DESC
            LIMIT ?
        ");

        $stmt->execute([$id_usuario, $limit]);
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("Error al obtener actividades: " . $e->getMessage());
        return [];
    }
}

/**
 * Obtiene el registro de actividades con filtros avanzados
 */
function get_actividades_filtradas($filtros = []) {
    global $pdo;

    try {
        $where = [];
        $params = [];

        // Filtro por usuario
        if (!empty($filtros['id_usuario'])) {
            $where[] = "ra.id_usuario = ?";
            $params[] = $filtros['id_usuario'];
        }

        // Filtro por tipo de acción
        if (!empty($filtros['tipo_accion'])) {
            $where[] = "ra.tipo_accion = ?";
            $params[] = $filtros['tipo_accion'];
        }

        // Filtro por tabla afectada
        if (!empty($filtros['tabla_afectada'])) {
            $where[] = "ra.tabla_afectada = ?";
            $params[] = $filtros['tabla_afectada'];
        }

        // Filtro por rango de fechas
        if (!empty($filtros['fecha_inicio'])) {
            $where[] = "DATE(ra.fecha_accion) >= ?";
            $params[] = $filtros['fecha_inicio'];
        }

        if (!empty($filtros['fecha_fin'])) {
            $where[] = "DATE(ra.fecha_accion) <= ?";
            $params[] = $filtros['fecha_fin'];
        }

        // Búsqueda en descripción
        if (!empty($filtros['search'])) {
            $where[] = "ra.descripcion LIKE ?";
            $params[] = '%' . $filtros['search'] . '%';
        }

        // Construir WHERE clause
        $where_clause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

        // Contar total de resultados
        $count_sql = "
            SELECT COUNT(*) as total
            FROM registro_actividad ra
            $where_clause
        ";

        $count_stmt = $pdo->prepare($count_sql);
        $count_stmt->execute($params);
        $total = $count_stmt->fetch()['total'];

        // Paginación
        $page = max(1, (int)($filtros['page'] ?? 1));
        $per_page = (int)($filtros['per_page'] ?? 20);
        $offset = ($page - 1) * $per_page;

        // Obtener resultados con paginación
        $sql = "
            SELECT
                ra.*,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido,
                u.email as usuario_email,
                u.rol as usuario_rol
            FROM registro_actividad ra
            INNER JOIN usuario u ON u.id_usuario = ra.id_usuario
            $where_clause
            ORDER BY ra.fecha_accion DESC
            LIMIT ? OFFSET ?
        ";

        $params[] = $per_page;
        $params[] = $offset;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $actividades = $stmt->fetchAll();

        return [
            'actividades' => $actividades,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $per_page,
                'total' => $total,
                'total_pages' => ceil($total / $per_page)
            ]
        ];

    } catch (Exception $e) {
        error_log("Error al obtener actividades filtradas: " . $e->getMessage());
        return [
            'actividades' => [],
            'pagination' => [
                'current_page' => 1,
                'per_page' => 20,
                'total' => 0,
                'total_pages' => 0
            ]
        ];
    }
}
