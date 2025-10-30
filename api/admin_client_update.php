<?php
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/logger.php';
require_login_admin();

// Solo admins pueden acceder
if ($_SESSION['usuario_rol'] !== 'admin') {
    http_response_code(403);
    echo 'Acceso denegado';
    exit;
}

header('Content-Type: text/plain; charset=utf-8');

$id_cliente = (int)($_POST['id_cliente'] ?? 0);
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$email = trim($_POST['email'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$direccion = trim($_POST['direccion'] ?? '');

// Validaciones
if ($id_cliente <= 0 || !$nombre || !$apellido || !$email) {
    http_response_code(400);
    echo 'Datos inválidos';
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo 'Email inválido';
    exit;
}

try {
    $pdo->beginTransaction();
    
    // Verificar que el cliente existe
    $stmt = $pdo->prepare("SELECT nombre, apellido FROM CLIENTE WHERE id_cliente = ?");
    $stmt->execute([$id_cliente]);
    $cliente = $stmt->fetch();
    
    if (!$cliente) {
        http_response_code(404);
        echo 'Cliente no encontrado';
        exit;
    }
    
    // Verificar si el email ya existe en otro cliente
    $stmt = $pdo->prepare("SELECT id_cliente FROM CLIENTE WHERE email = ? AND id_cliente != ?");
    $stmt->execute([$email, $id_cliente]);
    if ($stmt->fetch()) {
        $pdo->rollBack();
        http_response_code(409);
        echo 'El email ya está en uso';
        exit;
    }
    
    // Actualizar cliente
    $stmt = $pdo->prepare("
        UPDATE CLIENTE SET
            nombre = ?,
            apellido = ?,
            email = ?,
            telefono = ?,
            direccion = ?
        WHERE id_cliente = ?
    ");
    
    $stmt->execute([$nombre, $apellido, $email, $telefono, $direccion, $id_cliente]);
    
    // Registrar actividad
    log_actividad(
        $_SESSION['usuario_id'],
        'editar',
        'CLIENTE',
        $id_cliente,
        "Modificó los datos del cliente $nombre $apellido (ID: $id_cliente)"
    );
    
    $pdo->commit();
    
    echo 'OK';
    
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo 'Error al actualizar cliente: ' . $e->getMessage();
}
