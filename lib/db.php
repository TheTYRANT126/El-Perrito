<?php
// IMPORTANTE: Guardar como UTF-8 SIN BOM

$DB_HOST = '127.0.0.1';
$DB_NAME = 'elperrito';
$DB_USER = 'root';
$DB_PASS = '';

try {
    $dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
    
} catch (PDOException $e) {
    // Log del error
    error_log("Error de conexión DB: " . $e->getMessage());
    
    // Enviar error al cliente
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => true,
        'message' => 'Error de conexión a la base de datos'
    ]);
    exit;
}