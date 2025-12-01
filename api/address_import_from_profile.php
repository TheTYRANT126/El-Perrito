<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Método no permitido';
    exit;
}

$cid = (int)$_SESSION['cliente_id'];

try {
    // Verificar que no tenga direcciones guardadas
    $st_check = $pdo->prepare("SELECT COUNT(*) as count FROM direccion_envio WHERE id_cliente = ?");
    $st_check->execute([$cid]);
    $result = $st_check->fetch();

    if ($result['count'] > 0) {
        http_response_code(400);
        echo 'Ya tienes direcciones guardadas';
        exit;
    }

    // Obtener datos del perfil
    $st_profile = $pdo->prepare("SELECT nombre, apellido, telefono, direccion FROM cliente WHERE id_cliente = ?");
    $st_profile->execute([$cid]);
    $cliente = $st_profile->fetch();

    if (!$cliente || empty($cliente['direccion'])) {
        http_response_code(400);
        echo 'No hay dirección en el perfil';
        exit;
    }

    // Crear dirección desde el perfil
    $nombre_completo = trim($cliente['nombre'] . ' ' . ($cliente['apellido'] ?? ''));
    $telefono = $cliente['telefono'] ?? 'Por definir';
    $calle = $cliente['direccion'];

    $sql = "INSERT INTO direccion_envio
            (id_cliente, nombre_completo, telefono, calle, colonia, ciudad, estado, codigo_postal, es_predeterminada)
            VALUES (?, ?, ?, ?, 'Por definir', 'Por definir', 'Por definir', '00000', 1)";

    $st = $pdo->prepare($sql);
    $st->execute([$cid, $nombre_completo, $telefono, $calle]);

    $id_direccion = (int)$pdo->lastInsertId();

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'id_direccion' => $id_direccion]);

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error al importar la dirección';
}
