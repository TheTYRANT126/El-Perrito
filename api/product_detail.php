<?php
require_once __DIR__ . '/../lib/db.php';
header('Content-Type: application/json; charset=utf-8');

$id = (int)($_GET['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

$st = $pdo->prepare("SELECT p.id_producto, p.nombre, p.descripcion, p.precio_venta, p.imagen, c.nombre as categoria
                     FROM PRODUCTO p JOIN CATEGORIA c ON c.id_categoria=p.id_categoria
                     WHERE p.id_producto=:id AND p.activo=1");
$st->execute([':id' => $id]);
$prod = $st->fetch();

if (!$prod) {
    http_response_code(404);
    echo json_encode(['error' => 'No encontrado']);
    exit;
}

// Agregar "images/" al campo imagen si no lo tiene
if ($prod['imagen']) {
    if (strpos($prod['imagen'], 'images/') !== 0) {
        $prod['imagen'] = 'images/' . $prod['imagen'];
    }
} else {
    $prod['imagen'] = 'images/placeholder.png';
}

// Buscar todas las imágenes en el directorio del producto
$img_dir = __DIR__ . '/../public/images/' . $id . '_product';
$imagenes = [];

if (is_dir($img_dir)) {
    // Buscar imágenes con la convención imagen1.jpg, imagen2.jpg, etc.
    for ($i = 1; $i <= 4; $i++) {
        $found = false;

        // Probar diferentes extensiones
        $extensions = ['jpg', 'jpeg', 'png', 'gif'];
        foreach ($extensions as $ext) {
            $filename = 'imagen' . $i . '.' . $ext;
            $filepath = $img_dir . '/' . $filename;

            if (file_exists($filepath)) {
                // Solo agregar si NO es la primera imagen (ya está en $prod['imagen'])
                if ($i > 1) {
                    $imagenes[] = ['url' => 'images/' . $id . '_product/' . $filename];
                }
                $found = true;
                break;
            }
        }
    }
}

echo json_encode([
    'producto' => $prod,
    'imagenes' => $imagenes
], JSON_UNESCAPED_UNICODE);
