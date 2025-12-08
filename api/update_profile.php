<?php

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

header('Content-Type: text/plain; charset=utf-8');

$cliente_id = (int)$_SESSION['cliente_id'];
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$email = trim($_POST['email'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$direccion = trim($_POST['direccion'] ?? '');
$new_password = $_POST['new_password'] ?? '';

if (!$nombre || !$apellido || !$email) {
    http_response_code(400);
    echo 'Faltan datos obligatorios';
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo 'Email inválido';
    exit;
}

try {
    $pdo->beginTransaction();

    // Verificar si el email ya existe para otro usuario
    $st = $pdo->prepare("SELECT id_cliente FROM cliente WHERE email = ? AND id_cliente != ?");
    $st->execute([$email, $cliente_id]);
    if ($st->fetch()) {
        $pdo->rollBack();
        http_response_code(409);
        echo 'El email ya está en uso';
        exit;
    }

    // Actualizar datos básicos
    $sql = "UPDATE cliente SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ?";
    $params = [$nombre, $apellido, $email, $telefono, $direccion];
    
    // Si hay nueva contraseña, actualizar también
    if ($new_password && strlen($new_password) >= 6) {
        $sql .= ", password_hash = ?";
        $params[] = password_hash($new_password, PASSWORD_BCRYPT);
    }
    
    $sql .= " WHERE id_cliente = ?";
    $params[] = $cliente_id;
    
    $st = $pdo->prepare($sql);
    $st->execute($params);
    
    // Actualizar nombre en la sesión
    $_SESSION['cliente_nombre'] = $nombre;
    
    $pdo->commit();
    echo 'OK';
    
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo 'Error del servidor';
}