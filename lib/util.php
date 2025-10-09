<?php
function json_input() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}
function json_out($payload, $code=200) {
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}
