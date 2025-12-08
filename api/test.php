<?php
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'status' => 'ok',
    'message' => 'La API funciona correctamente',
    'timestamp' => date('Y-m-d H:i:s')
], JSON_PRETTY_PRINT);