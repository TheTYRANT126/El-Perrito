<?php
require_once __DIR__ . '/../lib/session.php';
require_once __DIR__ . '/../lib/db.php';

$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$password = $_POST['password'] ?? '';

if (!$email || !$password) { http_response_code(400); echo 'Datos inválidos'; exit; }

try {
  // Cliente
  $st = $pdo->prepare("SELECT id_cliente, password_hash, nombre FROM CLIENTE WHERE email=:e LIMIT 1");
  $st->execute([':e'=>$email]);
  if ($u = $st->fetch()) {
    if (password_verify($password, $u['password_hash'])) {
      $_SESSION['cliente_id'] = (int)$u['id_cliente'];
      $_SESSION['cliente_nombre'] = $u['nombre'];
      echo 'OK_CLIENTE'; exit;
    }
  }
  // Admin
  $st = $pdo->prepare("SELECT id_usuario, password_hash, nombre, rol FROM USUARIO WHERE email=:e LIMIT 1");
  $st->execute([':e'=>$email]);
  if ($s = $st->fetch()) {
    if (password_verify($password, $s['password_hash'])) {
      $_SESSION['usuario_id'] = (int)$s['id_usuario'];
      $_SESSION['usuario_nombre'] = $s['nombre'];
      $_SESSION['usuario_rol'] = $s['rol'];
      echo 'OK_ADMIN'; exit;
    }
  }
  http_response_code(401); echo 'Credenciales incorrectas';
} catch (Throwable $e) {
  http_response_code(500); echo 'Error de servidor';
}
