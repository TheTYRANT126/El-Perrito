<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_admin();

$productoCrud = new \Spide\PUelperrito\Database\CrudProducto($pdo);
// Solo admins pueden acceder
if ($_SESSION['usuario_rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado.']);
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
    $stmt_cliente = $pdo->prepare("SELECT id_cliente, nombre, apellido, email FROM cliente WHERE id_cliente = ?");
    $stmt_cliente->execute([$id_cliente]);
    $cliente = $stmt_cliente->fetch(PDO::FETCH_ASSOC);

    if (!$cliente) {
        http_response_code(404);
        echo json_encode(['error' => 'Cliente no encontrado.']);
        exit;
    }

    // 2. Obtener todos los pedidos (ventas) del cliente
    $stmt_pedidos = $pdo->prepare("SELECT id_venta, fecha, total FROM venta WHERE id_cliente = ? ORDER BY fecha DESC");
    $stmt_pedidos->execute([$id_cliente]);
    $pedidos = $stmt_pedidos->fetchAll(PDO::FETCH_ASSOC);

    $pedidos_con_items = [];

    // 3. Para cada pedido, obtener sus detalles
    foreach ($pedidos as $pedido) {
        $id_venta = $pedido['id_venta'];
        
        $stmt_items = $pdo->prepare("
            SELECT
                dv.cantidad,
                dv.precio_unitario,
                p.nombre AS nombre_producto,
                p.imagen AS imagen_producto
            FROM detalle_venta dv
            JOIN producto p ON p.id_producto = dv.id_producto
            WHERE dv.id_venta = ?
        ");
        $stmt_items->execute([$id_venta]);
        $items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

        // Normalizar rutas de imágenes
        foreach ($items as &$item) {
            $item['imagen_producto'] = $productoCrud->normalizarRutaImagen($item['imagen_producto'] ?? null);
        }
        unset($item);

        $pedidos_con_items[] = [
            'id_pedido' => $id_venta,
            'fecha_pedido' => $pedido['fecha'],
            'total' => $pedido['total'],
            'items' => $items
        ];
    }

    // 4. Devolver la respuesta JSON
    echo json_encode([
        'cliente' => $cliente,
        'pedidos' => $pedidos_con_items
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en el servidor al obtener el historial de compras.']);
}
