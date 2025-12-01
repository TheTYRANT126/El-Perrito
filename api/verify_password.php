<?php

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

header('Content-Type: text/plain; charset=utf-8');

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo 'Datos inválidos';
    exit;
}

try {
    $st = $pdo->prepare("SELECT password_hash FROM CLIENTE WHERE email = ? AND id_cliente = ?");
    $st->execute([$email, $_SESSION['cliente_id']]);
    $user = $st->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo 'Usuario no encontrado';
        exit;
    }
    
    if (password_verify($password, $user['password_hash'])) {
        echo 'OK';
    } else {
        http_response_code(401);
        echo 'Contraseña incorrecta';
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo 'Error del servidor';
}