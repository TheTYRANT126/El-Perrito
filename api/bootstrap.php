<?php

declare(strict_types=1);

declare(strict_types=1);

$autoload = __DIR__ . '/../vendor/autoload.php';
if (file_exists($autoload)) {
    require_once $autoload;
} else {
    require_once __DIR__ . '/../src/database/Connection.php';
    require_once __DIR__ . '/../src/database/ValidConnection.php';
    require_once __DIR__ . '/../src/database/CrudProducto.php';
}

use Spide\PUelperrito\Database\Connection;
use Spide\PUelperrito\Database\ValidConnection;

try {
    $pdo = Connection::getInstance();
    ValidConnection::ensure($pdo);
} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => true,
        'message' => 'No se pudo establecer conexión con la base de datos.',
        'details' => $e->getMessage(),
    ]);
    exit;
}
