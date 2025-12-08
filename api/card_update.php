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

// Validar que se envió el ID
if (empty($_POST['id_tarjeta'])) {
    http_response_code(400);
    echo 'ID de tarjeta requerido';
    exit;
}

$id_tarjeta = (int)$_POST['id_tarjeta'];

// Verificar que la tarjeta pertenece al cliente
$sql_check = "SELECT id_tarjeta FROM tarjeta WHERE id_tarjeta = ? AND id_cliente = ? AND activa = 1";
$st_check = $pdo->prepare($sql_check);
$st_check->execute([$id_tarjeta, $cid]);

if (!$st_check->fetch()) {
    http_response_code(404);
    echo 'Tarjeta no encontrada';
    exit;
}

// Validar campos requeridos
$required = ['tipo_tarjeta', 'numero_tarjeta', 'cvv', 'nombre_titular', 'mes_expiracion', 'anio_expiracion'];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        http_response_code(400);
        echo "El campo {$field} es requerido";
        exit;
    }
}

$tipo_tarjeta = trim($_POST['tipo_tarjeta']);
$numero_tarjeta = trim($_POST['numero_tarjeta']);
$cvv = trim($_POST['cvv']);
$nombre_titular = trim($_POST['nombre_titular']);
$mes_expiracion = trim($_POST['mes_expiracion']);
$anio_expiracion = trim($_POST['anio_expiracion']);
$es_predeterminada = isset($_POST['es_predeterminada']) && $_POST['es_predeterminada'] == '1' ? 1 : 0;

// Validar tipo de tarjeta
$tipos_validos = ['visa', 'mastercard', 'amex', 'discover'];
if (!in_array($tipo_tarjeta, $tipos_validos)) {
    http_response_code(400);
    echo 'Tipo de tarjeta no válido';
    exit;
}

// Validar que el número de tarjeta tenga 13-19 dígitos
$numero_tarjeta_limpio = preg_replace('/\s+/', '', $numero_tarjeta);
if (!preg_match('/^\d{13,19}$/', $numero_tarjeta_limpio)) {
    http_response_code(400);
    echo 'El número de tarjeta debe tener entre 13 y 19 dígitos';
    exit;
}

// Validar CVV (3 o 4 dígitos)
if (!preg_match('/^\d{3,4}$/', $cvv)) {
    http_response_code(400);
    echo 'El CVV debe ser de 3 o 4 dígitos';
    exit;
}

// Validar mes (01-12)
if (!preg_match('/^(0[1-9]|1[0-2])$/', $mes_expiracion)) {
    http_response_code(400);
    echo 'Mes de expiración no válido (01-12)';
    exit;
}

// Validar año (4 dígitos)
if (!preg_match('/^\d{4}$/', $anio_expiracion)) {
    http_response_code(400);
    echo 'Año de expiración no válido';
    exit;
}

// Validar que la tarjeta no esté vencida
$fecha_actual = new DateTime();
$fecha_expiracion = DateTime::createFromFormat('Y-m', $anio_expiracion . '-' . $mes_expiracion);
$fecha_expiracion->modify('last day of this month');

if ($fecha_expiracion < $fecha_actual) {
    http_response_code(400);
    echo 'La tarjeta está vencida';
    exit;
}

try {
    $pdo->beginTransaction();

    // Si se marca como predeterminada, quitar la marca de las demás
    if ($es_predeterminada) {
        $pdo->prepare("UPDATE tarjeta SET es_predeterminada = 0 WHERE id_cliente = ? AND id_tarjeta != ? AND activa = 1")
            ->execute([$cid, $id_tarjeta]);
    }

    // Actualizar tarjeta
    $sql = "UPDATE tarjeta
            SET tipo_tarjeta = ?, numero_tarjeta = ?, cvv = ?, nombre_titular = ?,
                mes_expiracion = ?, anio_expiracion = ?, es_predeterminada = ?,
                fecha_modificacion = CURRENT_TIMESTAMP
            WHERE id_tarjeta = ? AND id_cliente = ?";

    $st = $pdo->prepare($sql);
    $st->execute([
        $tipo_tarjeta, $numero_tarjeta_limpio, $cvv, $nombre_titular, $mes_expiracion, $anio_expiracion,
        $es_predeterminada, $id_tarjeta, $cid
    ]);

    $pdo->commit();

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo 'Error al actualizar la tarjeta';
}
