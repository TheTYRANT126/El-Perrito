<?php
require_once __DIR__ . '/../lib/session.php';
require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

$response = ['status' => 'anon'];

if (isset($_SESSION['cliente_id'])) {
    $response['status'] = 'cliente';
    $response['id'] = $_SESSION['cliente_id'];
    $response['nombre'] = $_SESSION['cliente_nombre'] ?? '';
} 
else if (isset($_SESSION['usuario_id'])) {
    $response['status'] = 'admin';
    $response['id'] = $_SESSION['usuario_id'];

    // Intentar obtener información de la sesión primero
    $response['nombre'] = $_SESSION['usuario_nombre'] ?? '';
    $response['apellido'] = $_SESSION['usuario_apellido'] ?? '';
    $response['rol'] = $_SESSION['usuario_rol'] ?? '';

    // Si no hay apellido en sesión, obtenerlo de la base de datos
    if (empty($response['apellido']) || empty($response['rol'])) {
        try {
            $stmt = $pdo->prepare("SELECT nombre, apellido, rol FROM USUARIO WHERE id_usuario = ?");
            $stmt->execute([$_SESSION['usuario_id']]);
            if ($user = $stmt->fetch()) {
                $response['nombre'] = $user['nombre'];
                $response['apellido'] = $user['apellido'] ?? '';
                $response['rol'] = $user['rol'];

                // Actualizar sesión con los datos obtenidos
                $_SESSION['usuario_nombre'] = $user['nombre'];
                $_SESSION['usuario_apellido'] = $user['apellido'] ?? '';
                $_SESSION['usuario_rol'] = $user['rol'];
            }
        } catch (Exception $e) {
            // Continuar con los datos de sesión
        }
    }
}

echo json_encode($response);
