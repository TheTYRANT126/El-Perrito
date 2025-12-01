<?php

declare(strict_types=1);

use PDO;
use PHPUnit\Framework\TestCase;
use Spide\PUelperrito\Database\CrudProducto;

final class CrudProductoTest extends TestCase
{
    public function testNormalizarRutaImagenDevuelvePlaceholderCuandoNoHayImagen(): void
    {
        $crud = new CrudProducto(new PDO('sqlite::memory:'));
        $ruta = $crud->normalizarRutaImagen(null);

        $this->assertStringEndsWith('/src/assets/icon/placeholder.png', $ruta);
    }

    public function testNormalizarRutaImagenEliminaPrefijosAntiguos(): void
    {
        $crud = new CrudProducto(new PDO('sqlite::memory:'));
        $ruta = $crud->normalizarRutaImagen('images/25_product/imagen1.png');

        $this->assertStringEndsWith('/src/assets/icon/25_product/imagen1.png', $ruta);
    }
}
