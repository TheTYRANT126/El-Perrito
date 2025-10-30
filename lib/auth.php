<?php
require_once __DIR__.'/session.php';

function is_session_expired() {
  return !isset($_SESSION['last_activity']);
}

function require_login_cliente(){
  if (!isset($_SESSION['cliente_id']) || is_session_expired()) {
    http_response_code(401);
    echo "NO_LOGIN";
    exit;
  }
}
function require_login_admin(){
  if (!isset($_SESSION['usuario_id']) || is_session_expired()) {
    http_response_code(401);
    echo "NO_ADMIN";
    exit;
  }
}

function check_admin_session(){
  // Verificar que hay sesión de usuario (admin o operador)
  if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo "NO_ADMIN";
    exit;
  }
}

function check_only_admin_role(){
  // Verificar que el usuario tiene rol de admin (no operador)
  check_admin_session();

  if (!isset($_SESSION['usuario_rol']) || $_SESSION['usuario_rol'] !== 'admin') {
    http_response_code(403);
    echo "SOLO_ADMIN";
    exit;
  }
}
