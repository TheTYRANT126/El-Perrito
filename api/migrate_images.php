<?php
/**
 * Script de migración para renombrar imágenes con nombres aleatorios
 * a la convención imagen1.jpg, imagen2.jpg, etc.
 *
 * IMPORTANTE: Ejecutar este script solo UNA VEZ desde el navegador
 * URL: http://localhost/elperrito/api/migrate_images.php
 */

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Migración de Imágenes de Productos</h1>";
echo "<p>Renombrando imágenes a convención imagen1.jpg, imagen2.jpg...</p>";

$images_dir = dirname(__DIR__) . '/src/assets';
$migrated = 0;
$errors = [];

try {
    // Obtener todos los productos con imágenes
    $stmt = $pdo->query("SELECT id_producto, imagen FROM producto WHERE imagen IS NOT NULL AND imagen != ''");
    $productos = $stmt->fetchAll();

    foreach ($productos as $producto) {
        $id_producto = $producto['id_producto'];
        $imagen_actual = $producto['imagen'];

        $product_dir = $images_dir . '/' . $id_producto . '_product';

        // Solo procesar si el directorio existe
        if (!is_dir($product_dir)) {
            continue;
        }

        // Obtener todas las imágenes en el directorio
        $files = glob($product_dir . '/*.{jpg,jpeg,png,gif}', GLOB_BRACE);

        // Si no hay archivos, continuar
        if (empty($files)) {
            continue;
        }

        // Ordenar archivos por fecha de modificación (más antiguo primero)
        usort($files, function($a, $b) {
            return filemtime($a) - filemtime($b);
        });

        $renamed_files = [];
        $index = 1;

        foreach ($files as $file) {
            $filename = basename($file);

            // Si ya tiene el formato correcto (imagen1.jpg), saltar
            if (preg_match('/^imagen\d+\.(jpg|jpeg|png|gif)$/i', $filename)) {
                $renamed_files[] = $id_producto . '_product/' . $filename;
                $index++;
                continue;
            }

            // Obtener extensión
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

            // Nuevo nombre
            $new_filename = 'imagen' . $index . '.' . $extension;
            $new_path = $product_dir . '/' . $new_filename;

            // Si ya existe un archivo con ese nombre, saltar para evitar sobrescribir
            if (file_exists($new_path) && $new_path !== $file) {
                $errors[] = "Producto $id_producto: No se puede renombrar $filename porque imagen$index.$extension ya existe";
                continue;
            }

            // Renombrar archivo
            if (rename($file, $new_path)) {
                $renamed_files[] = $id_producto . '_product/' . $new_filename;
                echo "<p>✓ Producto $id_producto: $filename → imagen$index.$extension</p>";
                $migrated++;
                $index++;
            } else {
                $errors[] = "Error al renombrar $filename en producto $id_producto";
            }
        }

        // Actualizar el campo imagen en la BD con la primera imagen
        if (!empty($renamed_files)) {
            $first_image = $renamed_files[0];
            $stmt = $pdo->prepare("UPDATE producto SET imagen = ? WHERE id_producto = ?");
            $stmt->execute([$first_image, $id_producto]);
            echo "<p style='color: green;'>✓ Actualizado campo imagen de producto $id_producto: $first_image</p>";
        }
    }

    echo "<hr>";
    echo "<h2>Resumen</h2>";
    echo "<p><strong>Imágenes migradas:</strong> $migrated</p>";

    if (!empty($errors)) {
        echo "<h3>Errores encontrados:</h3><ul>";
        foreach ($errors as $error) {
            echo "<li style='color: red;'>$error</li>";
        }
        echo "</ul>";
    } else {
        echo "<p style='color: green;'>✓ Migración completada sin errores</p>";
    }

    echo "<p><a href='../index.html'>← Volver al inicio</a></p>";

} catch (Exception $e) {
    echo "<p style='color: red;'><strong>Error:</strong> " . $e->getMessage() . "</p>";
}
