<?php
require_once __DIR__ . '/../lib/db.php';

// Limpiar buffer previo
if (ob_get_level()) {
    ob_clean();
}


header('Content-Type: text/plain; charset=utf-8');
// Evitar el cache
header('Cache-Control: no-cache, must-revalidate');

$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$email = trim($_POST['email'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$direccion = trim($_POST['direccion'] ?? '');
$pass = $_POST['password'] ?? '';
$confirm = $_POST['confirm_password'] ?? '';

if ($nombre==='' || $apellido==='' || $email==='' || $pass==='') { 
    http_response_code(400); 
    echo "FALTAN_DATOS"; 
    exit; 
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { 
    http_response_code(400); 
    echo "EMAIL_INVALIDO"; 
    exit; 
}

if ($pass !== $confirm) { 
    http_response_code(400); 
    echo "PASS_NO_COINCIDE"; 
    exit; 
}

if (strlen($pass) < 6) { 
    http_response_code(400); 
    echo "PASS_CORTA"; 
    exit; 
}

try {
    $st = $pdo->prepare("SELECT 1 FROM CLIENTE WHERE email=?");
    $st->execute([$email]);
    if ($st->fetch()) { 
        http_response_code(409); 
        echo "EMAIL_YA_EXISTE"; 
        exit; 
    }

    $hash = password_hash($pass, PASSWORD_BCRYPT);
    $st = $pdo->prepare("INSERT INTO CLIENTE(nombre, apellido, email, telefono, direccion, password_hash) VALUES (?,?,?,?,?,?)");
    $st->execute([$nombre,$apellido,$email,$telefono,$direccion,$hash]);
    

    echo "OK";
    exit; 
    
} catch (PDOException $e) {
    http_response_code(500);
    echo "ERROR_BD";
    exit;
}
