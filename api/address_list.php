<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

$cid = (int)$_SESSION['cliente_id'];

header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT id_direccion, nombre_completo, telefono, calle, numero_exterior, numero_interior,
               colonia, ciudad, estado, codigo_postal, referencias, es_predeterminada,
               fecha_creacion, 0 as from_profile
        FROM direccion_envio
        WHERE id_cliente = :cid
        ORDER BY es_predeterminada DESC, fecha_creacion DESC";

$st = $pdo->prepare($sql);
$st->execute([':cid' => $cid]);
$direcciones = $st->fetchAll();

// Si no hay direcciones guardadas, obtener la dirección del perfil
if (empty($direcciones)) {
    $sql_profile = "SELECT nombre, apellido, telefono, direccion
                    FROM cliente
                    WHERE id_cliente = :cid";
    $st_profile = $pdo->prepare($sql_profile);
    $st_profile->execute([':cid' => $cid]);
    $cliente = $st_profile->fetch();

    if ($cliente && !empty($cliente['direccion'])) {
        // Crear dirección temporal desde el perfil
        $direcciones[] = [
            'id_direccion' => 0, // ID 0 indica que es del perfil
            'nombre_completo' => trim($cliente['nombre'] . ' ' . ($cliente['apellido'] ?? '')),
            'telefono' => $cliente['telefono'] ?? 'No especificado',
            'calle' => $cliente['direccion'],
            'numero_exterior' => null,
            'numero_interior' => null,
            'colonia' => 'Por definir',
            'ciudad' => 'Por definir',
            'estado' => 'Por definir',
            'codigo_postal' => '00000',
            'referencias' => 'Dirección del perfil (requiere actualización)',
            'es_predeterminada' => 1,
            'fecha_creacion' => null,
            'from_profile' => 1
        ];
    }
}

echo json_encode($direcciones, JSON_UNESCAPED_UNICODE);
