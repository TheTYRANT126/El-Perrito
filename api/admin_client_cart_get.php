<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_admin();

$productoCrud = new \Spide\PUelperrito\Database\CrudProducto($pdo);
// Solo admins pueden acceder
if ($_SESSION['usuario_rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado. Solo los administradores pueden ver esta información.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$id_cliente = (int)($_GET['id_cliente'] ?? 0);

if ($id_cliente <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de cliente inválido.']);
    exit;
}

try {
    // 1. Obtener información del cliente
    $stmt_cliente = $pdo->prepare("SELECT id_cliente, nombre, apellido, email FROM CLIENTE WHERE id_cliente = ?");
    $stmt_cliente->execute([$id_cliente]);
    $cliente = $stmt_cliente->fetch(PDO::FETCH_ASSOC);

    if (!$cliente) {
        http_response_code(404);
        echo json_encode(['error' => 'Cliente no encontrado.']);
        exit;
    }

    // 2. Encontrar el carrito activo del cliente
    $stmt_carrito = $pdo->prepare("SELECT id_carrito FROM CARRITO WHERE id_cliente = ? AND estado = 'activo'");
    $stmt_carrito->execute([$id_cliente]);
    $carrito_activo = $stmt_carrito->fetch(PDO::FETCH_ASSOC);

    $items = [];
    if ($carrito_activo) {
        $id_carrito = $carrito_activo['id_carrito'];

        // 3. Obtener los items del carrito
        $stmt_items = $pdo->prepare("
            SELECT 
                p.id_producto,
                dc.cantidad,
                dc.precio_unitario AS precio_venta,
                p.nombre AS nombre_producto,
                p.imagen AS imagen_producto
            FROM DETALLE_CARRITO dc
            JOIN PRODUCTO p ON p.id_producto = dc.id_producto
            WHERE dc.id_carrito = ?
        ");
        $stmt_items->execute([$id_carrito]);
        $items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

        // Normalizar rutas de imágenes
        foreach ($items as &$item) {
            $item['imagen_producto'] = $productoCrud->normalizarRutaImagen($item['imagen_producto'] ?? null);
        }
        unset($item);
    }

    // 4. Devolver la respuesta JSON
    echo json_encode([
        'cliente' => $cliente,
        'carrito' => $items
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    // No exponer detalles del error en producción
    echo json_encode(['error' => 'Error en el servidor al obtener el carrito del cliente.']);
    // Para depuración, podrías loggear $e->getMessage()
}
