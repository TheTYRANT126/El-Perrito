<?php

namespace Spide\PUelperrito\Database;

use PDO;
use RuntimeException;

class ValidConnection
{
    public static function ensure(PDO $pdo): void
    {
        if (!$pdo instanceof PDO) {
            throw new RuntimeException('No existe una conexión activa.');
        }

        $statement = $pdo->query('SELECT 1');
        if ($statement === false || (int) $statement->fetchColumn() !== 1) {
            throw new RuntimeException('No se pudo validar la conexión a la base de datos.');
        }
    }
}
