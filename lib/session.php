<?php
if (session_status() === PHP_SESSION_NONE) {
  session_set_cookie_params([
    'lifetime' => 60*60*24*7,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
  ]);
  session_start();
}
