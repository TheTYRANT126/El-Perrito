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
