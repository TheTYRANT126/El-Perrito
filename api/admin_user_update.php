<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/logger.php';
require_login_admin();

// Solo admins pueden acceder
if ($_SESSION['usuario_rol'] !== 'admin') {
    http_response_code(403);
    echo 'Acceso denegado';
    exit;
}

header('Content-Type: text/plain; charset=utf-8');

$id_usuario = (int)($_POST['id_usuario'] ?? 0);
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$email = trim($_POST['email'] ?? '');
$curp = trim($_POST['curp'] ?? '');
$fecha_nacimiento = trim($_POST['fecha_nacimiento'] ?? '');
$direccion = trim($_POST['direccion'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$rol = trim($_POST['rol'] ?? '');
$nueva_password = trim($_POST['nueva_password'] ?? '');

// Validaciones
if ($id_usuario <= 0 || !$nombre || !$email) {
    http_response_code(400);
    echo 'Datos inválidos';
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo 'Email inválido';
    exit;
}

if ($rol && !in_array($rol, ['admin', 'operador'])) {
    http_response_code(400);
    echo 'Rol inválido';
    exit;
}

try {
    $pdo->beginTransaction();
    
    // Obtener datos actuales
    $stmt = $pdo->prepare("SELECT * FROM USUARIO WHERE id_usuario = ?");
    $stmt->execute([$id_usuario]);
    $datos_actuales = $stmt->fetch();
    
    if (!$datos_actuales) {
        http_response_code(404);
        echo 'Usuario no encontrado';
        exit;
    }
    
    // Verificar si el email ya existe en otro usuario
    $stmt = $pdo->prepare("SELECT id_usuario FROM USUARIO WHERE email = ? AND id_usuario != ?");
    $stmt->execute([$email, $id_usuario]);
    if ($stmt->fetch()) {
        $pdo->rollBack();
        http_response_code(409);
        echo 'El email ya está en uso';
        exit;
    }
    
    $id_modificador = $_SESSION['usuario_id'];
    
    // Registrar cambios en el historial
    if ($datos_actuales['nombre'] != $nombre) {
        log_usuario_cambio($id_usuario, 'nombre', $datos_actuales['nombre'], $nombre, $id_modificador);
    }
    
    if ($datos_actuales['apellido'] != $apellido) {
        log_usuario_cambio($id_usuario, 'apellido', $datos_actuales['apellido'], $apellido, $id_modificador);
    }
    
    if ($datos_actuales['email'] != $email) {
        log_usuario_cambio($id_usuario, 'email', $datos_actuales['email'], $email, $id_modificador);
    }
    
    if ($datos_actuales['curp'] != $curp) {
        log_usuario_cambio($id_usuario, 'curp', $datos_actuales['curp'], $curp, $id_modificador);
    }
    
    if ($datos_actuales['fecha_nacimiento'] != ($fecha_nacimiento ?: null)) {
        log_usuario_cambio($id_usuario, 'fecha_nacimiento', $datos_actuales['fecha_nacimiento'], $fecha_nacimiento, $id_modificador);
    }
    
    if ($datos_actuales['direccion'] != $direccion) {
        log_usuario_cambio($id_usuario, 'direccion', $datos_actuales['direccion'], $direccion, $id_modificador);
    }
    
    if ($datos_actuales['telefono'] != $telefono) {
        log_usuario_cambio($id_usuario, 'telefono', $datos_actuales['telefono'], $telefono, $id_modificador);
    }
    
    if ($datos_actuales['rol'] != $rol) {
        log_usuario_cambio($id_usuario, 'rol', $datos_actuales['rol'], $rol, $id_modificador);
    }
    
    if ($nueva_password) {
        log_usuario_cambio($id_usuario, 'password', '***', '*** (cambiada)', $id_modificador);
    }
    
    // Actualizar usuario
    $sql = "UPDATE USUARIO SET 
            nombre = ?,
            apellido = ?,
            email = ?,
            curp = ?,
            fecha_nacimiento = ?,
            direccion = ?,
            telefono = ?,
            rol = ?,
            fecha_ultima_modificacion = NOW()";
    
    $params = [$nombre, $apellido, $email, $curp, $fecha_nacimiento ?: null, $direccion, $telefono, $rol];
    
    if ($nueva_password) {
        $sql .= ", password_hash = ?";
        $params[] = password_hash($nueva_password, PASSWORD_BCRYPT);
    }
    
    $sql .= " WHERE id_usuario = ?";
    $params[] = $id_usuario;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Registrar actividad
    log_actividad(
        $id_modificador,
        'editar',
        'USUARIO',
        $id_usuario,
        "Modificó el usuario $nombre $apellido (ID: $id_usuario)"
    );
    
    $pdo->commit();
    
    echo 'OK';
    
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo 'Error al actualizar usuario: ' . $e->getMessage();
}
