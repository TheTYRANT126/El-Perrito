<?php

namespace Spide\PUelperrito\Database;

use PDO;
use RuntimeException;

class CrudProducto
{
    /** @var PDO */
    private $pdo;
    /** @var string */
    private $assetBaseUrl;
    /** @var string */
    private $assetDiskPath;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->assetBaseUrl = $this->resolveAssetBaseUrl();
        $this->assetDiskPath = $this->resolveAssetDiskPath();
    }

    public function listar(array $filters = []): array
    {
        $sql = 'SELECT id_producto, nombre, precio_venta, imagen FROM PRODUCTO WHERE activo = 1';
        $params = [];

        if (!empty($filters['categoria'])) {
            $sql .= ' AND id_categoria = ?';
            $params[] = (int) $filters['categoria'];
        }

        if (!empty($filters['q'])) {
            $sql .= ' AND nombre LIKE ?';
            $params[] = '%' . trim($filters['q']) . '%';
        }

        $sql .= ' ORDER BY nombre';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        $productos = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $productos[] = [
                'id_producto' => (int) $row['id_producto'],
                'nombre' => $row['nombre'],
                'precio_venta' => (float) $row['precio_venta'],
                'imagen' => $this->normalizarRutaImagen($row['imagen'] ?? null)
            ];
        }

        return $productos;
    }

    public function obtenerDetalle(int $idProducto): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT p.id_producto, p.nombre, p.descripcion, p.precio_venta, p.imagen, '
            . 'c.nombre AS categoria '
            . 'FROM PRODUCTO p '
            . 'JOIN CATEGORIA c ON c.id_categoria = p.id_categoria '
            . 'WHERE p.id_producto = :id AND p.activo = 1'
        );
        $stmt->execute([':id' => $idProducto]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$producto) {
            throw new RuntimeException('Producto no encontrado');
        }

        $producto['imagen'] = $this->normalizarRutaImagen($producto['imagen'] ?? null);

        return [
            'producto' => $producto,
            'imagenes' => $this->obtenerGaleria($idProducto)
        ];
    }

    public function normalizarRutaImagen(?string $ruta): string
    {
        if (!$ruta) {
            return $this->assetUrl('placeholder.png');
        }

        $limpia = str_replace(['..', '\\\\'], '', $ruta);
        $limpia = trim($limpia, '/');

        if ($limpia === '') {
            return $this->assetUrl('placeholder.png');
        }

        $prefijos = [
            'images/',
            'icon/',
            'src/assets/',
            'src/assets/icon/'
        ];

        foreach ($prefijos as $prefijo) {
            if ($this->startsWith($limpia, $prefijo)) {
                $limpia = substr($limpia, strlen($prefijo));
            }
        }

        return $this->assetUrl($limpia);
    }

    private function obtenerGaleria(int $idProducto): array
    {
        $imagenes = [];
        $directorio = $this->assetDiskPath . '/' . $idProducto . '_product';

        if (!is_dir($directorio)) {
            return $imagenes;
        }

        $extensiones = ['jpg', 'jpeg', 'png', 'gif'];
        for ($i = 1; $i <= 4; $i++) {
            foreach ($extensiones as $ext) {
                $archivo = sprintf('imagen%d.%s', $i, $ext);
                $rutaCompleta = $directorio . '/' . $archivo;
                if (is_file($rutaCompleta)) {
                    if ($i > 1) {
                        $imagenes[] = ['url' => $this->assetUrl($idProducto . '_product/' . $archivo)];
                    }
                    break;
                }
            }
        }

        return $imagenes;
    }

    private function assetUrl(string $relative): string
    {
        return $this->assetBaseUrl . '/' . ltrim($relative, '/');
    }

    private function resolveAssetBaseUrl(): string
    {
        $script = $_SERVER['SCRIPT_NAME'] ?? '';
        $prefix = '';

        if ($script && ($pos = strpos($script, '/api/')) !== false) {
            $prefix = substr($script, 0, $pos);
        } elseif ($script) {
            $prefix = rtrim(dirname($script), '/');
        }

        if ($prefix === '/' || $prefix === '.') {
            $prefix = '';
        }

        return $prefix . '/src/assets';
    }

    private function resolveAssetDiskPath(): string
    {
        return dirname(__DIR__) . '/assets';
    }

    private function startsWith(string $haystack, string $needle): bool
    {
        if ($needle === '') {
            return true;
        }

        return strncmp($haystack, $needle, strlen($needle)) === 0;
    }
}
