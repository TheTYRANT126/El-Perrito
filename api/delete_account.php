<?php

if (ob_get_level()) {
    ob_clean();
}

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_login_cliente();

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

$cliente_id = (int)$_SESSION['cliente_id'];
$password = $_POST['password'] ?? '';

if (!$password) {
    http_response_code(400);
    echo 'Contraseña requerida';
    exit;
}

try {
    // Verificar contraseña
    $st = $pdo->prepare("SELECT password_hash, email FROM cliente WHERE id_cliente = ?");
    $st->execute([$cliente_id]);
    $user = $st->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo 'Usuario no encontrado';
        exit;
    }
    
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo 'Contraseña incorrecta';
        exit;
    }
    
    // Iniciar transacción para eliminar todo
    $pdo->beginTransaction();
    
    try {
        // 1. Eliminar detalles de carritos del cliente
        $st = $pdo->prepare("DELETE dc FROM detalle_carrito dc
                           INNER JOIN carrito c ON c.id_carrito = dc.id_carrito
                           WHERE c.id_cliente = ?");
        $st->execute([$cliente_id]);

        // 2. Eliminar carritos del cliente
        $st = $pdo->prepare("DELETE FROM carrito WHERE id_cliente = ?");
        $st->execute([$cliente_id]);

        // 3. Eliminar detalles de ventas del cliente
        $st = $pdo->prepare("DELETE dv FROM detalle_venta dv
                           INNER JOIN venta v ON v.id_venta = dv.id_venta
                           WHERE v.id_cliente = ?");
        $st->execute([$cliente_id]);

        // 4. Eliminar ventas del cliente
        $st = $pdo->prepare("DELETE FROM venta WHERE id_cliente = ?");
        $st->execute([$cliente_id]);

        // 5. Eliminar el cliente
        $st = $pdo->prepare("DELETE FROM cliente WHERE id_cliente = ?");
        $st->execute([$cliente_id]);
        
        // Commit de la transacción
        $pdo->commit();
        
        // Destruir todas las variables de sesión
        $_SESSION = array();
        
        // Destruir la cookie de sesión
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        // Destruir la sesión
        session_destroy();
        
        echo 'OK';
        
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Error en transacción de eliminación: " . $e->getMessage());
        http_response_code(500);
        echo 'Error en base de datos: ' . $e->getMessage();
        exit;
    }
    
} catch (Exception $e) {
    error_log("Error general al eliminar cuenta: " . $e->getMessage());
    http_response_code(500);
    echo 'Error del servidor: ' . $e->getMessage();
}