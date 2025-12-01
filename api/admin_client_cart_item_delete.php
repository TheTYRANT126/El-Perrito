<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_admin();

// Solo admins pueden acceder
if ($_SESSION['usuario_rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

$id_cliente = (int)($_POST['id_cliente'] ?? 0);
$id_producto = (int)($_POST['id_producto'] ?? 0);

if ($id_cliente <= 0 || $id_producto <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos. Se requiere ID de cliente y de producto.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Encontrar el carrito activo del cliente
    $stmt_carrito = $pdo->prepare("SELECT id_carrito FROM CARRITO WHERE id_cliente = ? AND estado = 'activo'");
    $stmt_carrito->execute([$id_cliente]);
    $carrito_activo = $stmt_carrito->fetch(PDO::FETCH_ASSOC);

    if (!$carrito_activo) {
        // No hay carrito activo, por lo que no hay nada que borrar.
        // Se considera un éxito porque el estado final es el deseado.
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'El cliente no tiene un carrito activo.']);
        exit;
    }

    $id_carrito = $carrito_activo['id_carrito'];

    // 2. Eliminar el item del carrito
    $stmt_delete = $pdo->prepare("DELETE FROM DETALLE_CARRITO WHERE id_carrito = ? AND id_producto = ?");
    $stmt_delete->execute([$id_carrito, $id_producto]);

    $rowCount = $stmt_delete->rowCount();

    if ($rowCount === 0) {
        // El producto no estaba en el carrito, lo cual no es un error fatal.
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'El producto no se encontraba en el carrito.']);
        exit;
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Producto eliminado del carrito.']);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Error en el servidor al eliminar el producto del carrito.']);
}
