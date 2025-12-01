<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/logger.php';

// Verificar sesión de admin o operador
check_admin_session();

header('Content-Type: application/json; charset=utf-8');

$productoCrud = new \Spide\PUelperrito\Database\CrudProducto($pdo);

$id_producto = (int)($_POST['id_producto'] ?? 0);

if ($id_producto <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de producto inválido']);
    exit;
}

// Verificar que el producto existe
$stmt = $pdo->prepare("SELECT nombre FROM PRODUCTO WHERE id_producto = ?");
$stmt->execute([$id_producto]);
$producto = $stmt->fetch();

if (!$producto) {
    http_response_code(404);
    echo json_encode(['error' => 'Producto no encontrado']);
    exit;
}

// Crear directorio si no existe
$upload_dir = dirname(__DIR__) . '/src/assets/' . $id_producto . '_product';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Contar imágenes existentes con la convención imagen1.jpg, imagen2.jpg, etc.
$existing_count = 0;
for ($i = 1; $i <= 4; $i++) {
    $check_files = [
        $upload_dir . '/imagen' . $i . '.jpg',
        $upload_dir . '/imagen' . $i . '.jpeg',
        $upload_dir . '/imagen' . $i . '.png',
        $upload_dir . '/imagen' . $i . '.gif'
    ];

    foreach ($check_files as $check_file) {
        if (file_exists($check_file)) {
            $existing_count++;
            break;
        }
    }
}

// Verificar que no se exceda el límite de 4 imágenes
if (!isset($_FILES['images'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se enviaron imágenes']);
    exit;
}

$uploaded_files = [];
$errors = [];

// Procesar cada imagen
$files = $_FILES['images'];
$file_count = is_array($files['name']) ? count($files['name']) : 1;

if ($existing_count + $file_count > 4) {
    http_response_code(400);
    echo json_encode(['error' => 'Límite de 4 imágenes excedido. Ya tienes ' . $existing_count . ' imagen(es).']);
    exit;
}

$current_index = $existing_count + 1; // Empezar desde la siguiente posición

for ($i = 0; $i < $file_count; $i++) {
    $file_name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
    $file_tmp = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
    $file_error = is_array($files['error']) ? $files['error'][$i] : $files['error'];
    $file_size = is_array($files['size']) ? $files['size'][$i] : $files['size'];

    // Verificar errores
    if ($file_error !== UPLOAD_ERR_OK) {
        $errors[] = "Error al subir $file_name";
        continue;
    }

    // Verificar tamaño (máximo 5MB)
    if ($file_size > 5 * 1024 * 1024) {
        $errors[] = "$file_name es demasiado grande (máximo 5MB)";
        continue;
    }

    // Verificar tipo de archivo
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $file_tmp);
    finfo_close($finfo);

    if (!in_array($mime_type, $allowed_types)) {
        $errors[] = "$file_name no es una imagen válida";
        continue;
    }

    // Determinar extensión según MIME type
    $extension_map = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif'
    ];
    $extension = $extension_map[$mime_type] ?? 'jpg';

    // Usar convención imagen1.jpg, imagen2.jpg, etc.
    $new_name = 'imagen' . $current_index . '.' . $extension;
    $destination = $upload_dir . '/' . $new_name;

    // Mover archivo
    if (move_uploaded_file($file_tmp, $destination)) {
        $uploaded_files[] = $id_producto . '_product/' . $new_name;
        $current_index++;
    } else {
        $errors[] = "Error al guardar $file_name";
    }
}

// SIEMPRE actualizar el campo imagen con la primera imagen disponible
if (count($uploaded_files) > 0 || $existing_count > 0) {
    // Buscar la primera imagen que exista
    $first_image = null;
    for ($i = 1; $i <= 4; $i++) {
        $possible_files = [
            $id_producto . '_product/imagen' . $i . '.jpg',
            $id_producto . '_product/imagen' . $i . '.jpeg',
            $id_producto . '_product/imagen' . $i . '.png',
            $id_producto . '_product/imagen' . $i . '.gif'
        ];

        foreach ($possible_files as $possible) {
            if (file_exists($upload_dir . '/imagen' . $i . '.' . pathinfo($possible, PATHINFO_EXTENSION))) {
                $first_image = $possible;
                break 2; // Salir de ambos loops
            }
        }
    }

    if ($first_image) {
        $stmt = $pdo->prepare("UPDATE PRODUCTO SET imagen = ? WHERE id_producto = ?");
        $stmt->execute([$first_image, $id_producto]);
    }
}

// Registrar actividad
if (count($uploaded_files) > 0) {
    log_actividad(
        $_SESSION['usuario_id'],
        'editar',
        'PRODUCTO',
        $id_producto,
        sprintf("Subió %d imagen(es) al producto '%s'", count($uploaded_files), $producto['nombre'])
    );
}

echo json_encode([
    'success' => true,
    'uploaded' => array_map(
        static fn (string $path) => $productoCrud->normalizarRutaImagen($path),
        $uploaded_files
    ),
    'errors' => $errors,
    'total_images' => $existing_count + count($uploaded_files)
]);
