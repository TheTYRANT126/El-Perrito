<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/logger.php';

// Solo admins pueden desactivar/activar usuarios
require_login_admin();

if ($_SESSION['usuario_rol'] !== 'admin') {
    http_response_code(403);
    echo 'Acceso denegado. Solo administradores pueden desactivar usuarios.';
    exit;
}

header('Content-Type: text/plain; charset=utf-8');

$id_usuario = (int)($_POST['id_usuario'] ?? 0);
$accion = trim($_POST['accion'] ?? ''); // 'desactivar' o 'activar'

// Validaciones
if ($id_usuario <= 0) {
    http_response_code(400);
    echo 'ID de usuario inválido';
    exit;
}

if (!in_array($accion, ['desactivar', 'activar'])) {
    http_response_code(400);
    echo 'Acción inválida. Use "desactivar" o "activar".';
    exit;
}

// No permitir que un usuario se desactive a sí mismo
if ($id_usuario == $_SESSION['usuario_id']) {
    http_response_code(400);
    echo 'No puede desactivar su propia cuenta';
    exit;
}

try {
    $pdo->beginTransaction();

    // Obtener datos actuales del usuario
    $stmt = $pdo->prepare("SELECT nombre, apellido, activo FROM usuario WHERE id_usuario = ?");
    $stmt->execute([$id_usuario]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        $pdo->rollBack();
        http_response_code(404);
        echo 'Usuario no encontrado';
        exit;
    }

    $nombre_completo = trim($usuario['nombre'] . ' ' . $usuario['apellido']);
    $estado_actual = $usuario['activo'];
    $nuevo_estado = ($accion === 'desactivar') ? 0 : 1;

    // Verificar si ya está en el estado deseado
    if ($estado_actual == $nuevo_estado) {
        $pdo->rollBack();
        $mensaje = ($nuevo_estado == 0) ? 'ya está inactivo' : 'ya está activo';
        http_response_code(400);
        echo "El usuario $mensaje";
        exit;
    }

    // Actualizar estado del usuario
    $stmt = $pdo->prepare("
        UPDATE usuario
        SET activo = ?,
            fecha_ultima_modificacion = NOW()
        WHERE id_usuario = ?
    ");
    $stmt->execute([$nuevo_estado, $id_usuario]);

    // Registrar en historial de usuario
    log_usuario_cambio(
        $id_usuario,
        'activo',
        $estado_actual == 1 ? 'Activo' : 'Inactivo',
        $nuevo_estado == 1 ? 'Activo' : 'Inactivo',
        $_SESSION['usuario_id']
    );

    // Registrar en log de actividades
    $descripcion = ($nuevo_estado == 0)
        ? "Desactivó al usuario: $nombre_completo (ID: $id_usuario)"
        : "Activó al usuario: $nombre_completo (ID: $id_usuario)";

    log_actividad(
        $_SESSION['usuario_id'],
        $accion,
        'usuario',
        $id_usuario,
        $descripcion
    );

    $pdo->commit();

    echo 'OK';

} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Error en admin_user_toggle_active: " . $e->getMessage());
    http_response_code(500);
    echo 'Error al cambiar estado del usuario';
}
