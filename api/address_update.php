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
$id_direccion = isset($_POST['id_direccion']) ? (int)$_POST['id_direccion'] : 0;

if (!$id_direccion) {
    http_response_code(400);
    echo 'ID de dirección no proporcionado';
    exit;
}

// Verificar que la dirección pertenece al cliente
$st = $pdo->prepare("SELECT id_direccion FROM direccion_envio WHERE id_direccion = ? AND id_cliente = ?");
$st->execute([$id_direccion, $cid]);
if (!$st->fetch()) {
    http_response_code(404);
    echo 'Dirección no encontrada';
    exit;
}

// Validar campos requeridos
$required = ['nombre_completo', 'telefono', 'calle', 'colonia', 'ciudad', 'estado', 'codigo_postal'];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        http_response_code(400);
        echo "El campo {$field} es requerido";
        exit;
    }
}

$nombre_completo = trim($_POST['nombre_completo']);
$telefono = trim($_POST['telefono']);
$calle = trim($_POST['calle']);
$numero_exterior = isset($_POST['numero_exterior']) ? trim($_POST['numero_exterior']) : null;
$numero_interior = isset($_POST['numero_interior']) ? trim($_POST['numero_interior']) : null;
$colonia = trim($_POST['colonia']);
$ciudad = trim($_POST['ciudad']);
$estado = trim($_POST['estado']);
$codigo_postal = trim($_POST['codigo_postal']);
$referencias = isset($_POST['referencias']) ? trim($_POST['referencias']) : null;
$es_predeterminada = isset($_POST['es_predeterminada']) && $_POST['es_predeterminada'] == '1' ? 1 : 0;

try {
    $pdo->beginTransaction();

    // Si se marca como predeterminada, quitar la marca de las demás
    if ($es_predeterminada) {
        $pdo->prepare("UPDATE direccion_envio SET es_predeterminada = 0 WHERE id_cliente = ? AND id_direccion != ?")
            ->execute([$cid, $id_direccion]);
    }

    // Actualizar dirección
    $sql = "UPDATE direccion_envio
            SET nombre_completo = ?, telefono = ?, calle = ?, numero_exterior = ?, numero_interior = ?,
                colonia = ?, ciudad = ?, estado = ?, codigo_postal = ?, referencias = ?, es_predeterminada = ?
            WHERE id_direccion = ? AND id_cliente = ?";

    $st = $pdo->prepare($sql);
    $st->execute([
        $nombre_completo, $telefono, $calle, $numero_exterior, $numero_interior,
        $colonia, $ciudad, $estado, $codigo_postal, $referencias, $es_predeterminada,
        $id_direccion, $cid
    ]);

    $pdo->commit();
    echo 'OK';

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo 'Error al actualizar la dirección';
}
