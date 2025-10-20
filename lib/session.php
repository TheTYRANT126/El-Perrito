<?php
if (session_status() === PHP_SESSION_NONE) {
  session_set_cookie_params([
    'lifetime' => 30*60, // 30 minutos
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
  ]);
  session_start();
}

// Configurar tiempo de expiración de sesión 
$session_timeout = 30 * 60; // 30 minutos en segundos

// Verificar si la sesión ha expirado
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $session_timeout)) {
  // La sesión ha expirado, destruirla
  session_unset();
  session_destroy();
  session_start();
}

// Actualizar el tiempo de última actividad
$_SESSION['last_activity'] = time();