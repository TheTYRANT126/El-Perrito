<?php

error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar en pantall
ini_set('log_errors', 1);      // Sí guardar en log

// Limpiar buffer
if (ob_get_level()) ob_end_clean();
ob_start();

// Intentar cargar db.php
try {
    require_once __DIR__ . '/../lib/db.php';
} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => true,
        'message' => 'Error al cargar base de datos',
        'details' => $e->getMessage()
    ]);
    exit;
}

ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    // Verificar que $pdo existe
    if (!isset($pdo)) {
        throw new Exception('No hay conexión a la base de datos');
    }
    
    $q = isset($_GET['q']) ? trim($_GET['q']) : '';
    $cat = isset($_GET['cat']) ? (int)$_GET['cat'] : 0;
    
    $sql = "SELECT id_producto, nombre, precio_venta, imagen FROM PRODUCTO WHERE activo=1";
    $params = [];
    
    if ($cat > 0) { 
        $sql .= " AND id_categoria=?"; 
        $params[] = $cat; 
    }
    
    if ($q !== '') { 
        $sql .= " AND nombre LIKE ?"; 
        $params[] = '%'.$q.'%'; 
    }
    
    $sql .= " ORDER BY nombre";
    
    error_log("SQL: $sql");
    error_log("Params: " . json_encode($params));
    
    $st = $pdo->prepare($sql);
    $st->execute($params);
    
    $out = [];
    while ($r = $st->fetch()) {
        // Asegurar que la imagen siempre tenga "images/" al inicio
        $imagen_path = 'images/placeholder.png';
        if ($r['imagen']) {
            // Si la imagen ya tiene "images/" al inicio, no duplicar
            if (strpos($r['imagen'], 'images/') === 0) {
                $imagen_path = $r['imagen'];
            } else {
                $imagen_path = 'images/' . $r['imagen'];
            }
        }

        $out[] = [
            'id_producto' => (int)$r['id_producto'],
            'nombre' => $r['nombre'],
            'precio_venta' => (float)$r['precio_venta'],
            'imagen' => $imagen_path
        ];
    }
    
    error_log("Productos encontrados: " . count($out));
    
    ob_end_clean();
    echo json_encode($out, JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    error_log("Error PDO en products_list: " . $e->getMessage());
    ob_end_clean();
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Error de base de datos',
        'details' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
    
} catch (Exception $e) {
    error_log("Error general en products_list: " . $e->getMessage());
    ob_end_clean();
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Error del servidor',
        'details' => $e->getMessage()
    ]);
}