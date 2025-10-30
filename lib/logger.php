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
