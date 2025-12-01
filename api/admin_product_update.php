<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/logger.php';

// Verificar sesión de admin o operador
check_admin_session();

header('Content-Type: text/plain; charset=utf-8');

$id_producto = (int)($_POST['id_producto'] ?? 0);
$nombre = trim($_POST['nombre'] ?? '');
$id_categoria = (int)($_POST['id_categoria'] ?? 0);
$precio = (float)($_POST['precio_venta'] ?? 0);
$descripcion = trim($_POST['descripcion'] ?? '');
$es_medicamento = (int)($_POST['es_medicamento'] ?? 0);
$caducidad = trim($_POST['caducidad'] ?? '');
$stock = (int)($_POST['stock'] ?? 0);
$stock_minimo = (int)($_POST['stock_minimo'] ?? 0);

// Validaciones
if ($id_producto <= 0 || !$nombre || $id_categoria <= 0 || $precio <= 0) {
    http_response_code(400);
    echo 'Datos inválidos';
    exit;
}

// Validar fecha de caducidad si se proporciona
if ($caducidad && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $caducidad)) {
    http_response_code(400);
    echo 'Formato de fecha inválido';
    exit;
}

try {
    $pdo->beginTransaction();
    
    // Actualizar producto
    $stmt = $pdo->prepare("
        UPDATE PRODUCTO SET
            nombre = ?,
            id_categoria = ?,
            descripcion = ?,
            precio_venta = ?,
            caducidad = ?,
            es_medicamento = ?,
            fecha_modificacion = NOW()
        WHERE id_producto = ?
    ");
    
    $stmt->execute([
        $nombre,
        $id_categoria,
        $descripcion,
        $precio,
        $caducidad ?: null,
        $es_medicamento,
        $id_producto
    ]);
    
    // Actualizar inventario
    $stmt = $pdo->prepare("
        UPDATE INVENTARIO SET
            stock = ?,
            stock_minimo = ?
        WHERE id_producto = ?
    ");
    $stmt->execute([$stock, $stock_minimo, $id_producto]);
    
    // Registrar actividad
    log_actividad(
        $_SESSION['usuario_id'],
        'editar',
        'PRODUCTO',
        $id_producto,
        "Modificó el producto '$nombre' (ID: $id_producto)"
    );
    
    $pdo->commit();
    
    echo 'OK';
    
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo 'Error al actualizar producto: ' . $e->getMessage();
}
