<?php
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/logger.php';

// Solo admin puede crear usuarios
check_admin_session();

header('Content-Type: text/plain; charset=utf-8');

// Validar datos requeridos
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$rol = $_POST['rol'] ?? 'operador';
$password = $_POST['nueva_password'] ?? '';

// Validaciones
if (empty($nombre)) {
    http_response_code(400);
    echo 'El nombre es obligatorio';
    exit;
}

if (empty($apellido)) {
    http_response_code(400);
    echo 'El apellido es obligatorio';
    exit;
}

if (!$email) {
    http_response_code(400);
    echo 'Email inválido';
    exit;
}

if (empty($password)) {
    http_response_code(400);
    echo 'La contraseña es obligatoria';
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo 'La contraseña debe tener al menos 6 caracteres';
    exit;
}

if (!in_array($rol, ['admin', 'operador'])) {
    http_response_code(400);
    echo 'Rol inválido';
    exit;
}

// Datos opcionales
$telefono = trim($_POST['telefono'] ?? '');
$curp = strtoupper(trim($_POST['curp'] ?? ''));
$fecha_nacimiento = $_POST['fecha_nacimiento'] ?? null;
$direccion = trim($_POST['direccion'] ?? '');

// Validar CURP si se proporciona
if (!empty($curp) && !preg_match('/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/', $curp)) {
    http_response_code(400);
    echo 'CURP inválido (formato incorrecto)';
    exit;
}

try {
    // Verificar que el email no exista
    $stmt = $pdo->prepare("SELECT id_usuario FROM usuario WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo 'El email ya está registrado';
        exit;
    }

    // Hash de la contraseña
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // Insertar usuario
    $stmt = $pdo->prepare("
        INSERT INTO usuario (
            nombre, apellido, email, password_hash,
            telefono, curp, fecha_nacimiento, direccion,
            rol, activo, fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
    ");

    $stmt->execute([
        $nombre,
        $apellido,
        $email,
        $password_hash,
        $telefono ?: null,
        $curp ?: null,
        $fecha_nacimiento ?: null,
        $direccion ?: null,
        $rol
    ]);

    $id_usuario_nuevo = $pdo->lastInsertId();

    // Registrar actividad
    log_actividad(
        $_SESSION['usuario_id'],
        'crear',
        'usuario',
        $id_usuario_nuevo,
        "Creó usuario: $nombre $apellido ($email) con rol: $rol"
    );

    echo 'OK';

} catch (PDOException $e) {
    error_log("Error en admin_user_create: " . $e->getMessage());
    http_response_code(500);
    echo 'Error al crear usuario';
}
