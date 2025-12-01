<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/logger.php';

// Verificar sesión de admin o operador
check_admin_session();

header('Content-Type: application/json; charset=utf-8');

$nombre = trim($_POST['nombre'] ?? '');
$id_categoria = (int)($_POST['id_categoria'] ?? 0);
$precio = (float)($_POST['precio_venta'] ?? 0);
$descripcion = trim($_POST['descripcion'] ?? '');
$es_medicamento = (int)($_POST['es_medicamento'] ?? 0);
$caducidad = trim($_POST['caducidad'] ?? '');
$stock = (int)($_POST['stock'] ?? 0);
$stock_minimo = (int)($_POST['stock_minimo'] ?? 0);

// Validaciones
if (!$nombre || $id_categoria <= 0 || $precio <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Nombre, categoría y precio son obligatorios']);
    exit;
}

// Validar fecha de caducidad si se proporciona
if ($caducidad && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $caducidad)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Formato de fecha inválido']);
    exit;
}

try {
    $pdo->beginTransaction();
    
    // Insertar producto
    $stmt = $pdo->prepare("
        INSERT INTO PRODUCTO 
        (id_categoria, nombre, descripcion, precio_venta, caducidad, es_medicamento, activo, id_usuario_creador)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    ");
    
    $stmt->execute([
        $id_categoria,
        $nombre,
        $descripcion,
        $precio,
        $caducidad ?: null,
        $es_medicamento,
        $_SESSION['usuario_id']
    ]);
    
    $id_producto = (int)$pdo->lastInsertId();
    
    // Crear registro de inventario
    $stmt = $pdo->prepare("
        INSERT INTO INVENTARIO (id_producto, stock, stock_minimo)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$id_producto, $stock, $stock_minimo]);
    
    // Registrar actividad
    log_actividad(
        $_SESSION['usuario_id'],
        'crear',
        'PRODUCTO',
        $id_producto,
        "Creó el producto '$nombre' (ID: $id_producto)"
    );
    
    $pdo->commit();
    
    echo json_encode(['success' => true, 'id_producto' => $id_producto]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al crear producto: ' . $e->getMessage()]);
}
