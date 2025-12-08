<?php
// public/test_session.php
require_once __DIR__ . '/../lib/session.php';
require_once __DIR__ . '/../api/bootstrap.php';

// Información de depuración
$debug_info = [
    'session_id' => session_id(),
    'session_status' => session_status(),
    'session_save_path' => session_save_path(),
    'session_cookie_params' => session_get_cookie_params(),
    'session_data' => $_SESSION,
    'cookies' => $_COOKIE,
    'php_version' => PHP_VERSION,
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
];

// Verificar si hay un cliente logueado
$cliente_info = null;
if (isset($_SESSION['cliente_id'])) {
    try {
        $st = $pdo->prepare("SELECT id_cliente, nombre, apellido, email FROM CLIENTE WHERE id_cliente = ?");
        $st->execute([$_SESSION['cliente_id']]);
        $cliente_info = $st->fetch();
    } catch (Exception $e) {
        $cliente_info = ['error' => $e->getMessage()];
    }
}

// Verificar si hay un usuario admin logueado
$usuario_info = null;
if (isset($_SESSION['usuario_id'])) {
    try {
        $st = $pdo->prepare("SELECT id_usuario, nombre, email, rol FROM USUARIO WHERE id_usuario = ?");
        $st->execute([$_SESSION['usuario_id']]);
        $usuario_info = $st->fetch();
    } catch (Exception $e) {
        $usuario_info = ['error' => $e->getMessage()];
    }
}

// Verificar el carrito si hay cliente
$carrito_info = null;
if (isset($_SESSION['cliente_id'])) {
    try {
        $st = $pdo->prepare("SELECT * FROM CARRITO WHERE id_cliente = ? AND estado = 'activo' ORDER BY id_carrito DESC LIMIT 1");
        $st->execute([$_SESSION['cliente_id']]);
        $carrito_info = $st->fetch();
        
        if ($carrito_info) {
            $st2 = $pdo->prepare("SELECT COUNT(*) as items, SUM(cantidad) as total_cantidad FROM DETALLE_CARRITO WHERE id_carrito = ?");
            $st2->execute([$carrito_info['id_carrito']]);
            $carrito_stats = $st2->fetch();
            $carrito_info['stats'] = $carrito_stats;
        }
    } catch (Exception $e) {
        $carrito_info = ['error' => $e->getMessage()];
    }
}

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test de Sesión - El Perrito</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c5db5;
            border-bottom: 3px solid #2c5db5;
            padding-bottom: 10px;
        }
        h2 {
            color: #333;
            margin-top: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin: 5px;
        }
        .status.ok {
            background: #d4edda;
            color: #155724;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
        }
        .status.warning {
            background: #fff3cd;
            color: #856404;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border: 1px solid #ddd;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .card {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        .card h3 {
            margin-top: 0;
            color: #2c5db5;
        }
        button {
            background: #2c5db5;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            font-size: 16px;
        }
        button:hover {
            background: #1e4090;
        }
        .actions {
            margin: 20px 0;
            padding: 20px;
            background: #f0f7ff;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐕 Diagnóstico de Sesión - El Perrito</h1>
        
        <div class="actions">
            <h2>Acciones Rápidas</h2>
            <button onclick="window.location.href='login.html'">Ir a Login</button>
            <button onclick="window.location.href='cart.html'">Ver Carrito</button>
            <button onclick="window.location.href='index.html'">Ir a Inicio</button>
            <button onclick="testLogout()">Cerrar Sesión</button>
            <button onclick="window.location.reload()">Recargar</button>
        </div>

        <h2>Estado de la Sesión</h2>
        <div>
            <?php if (isset($_SESSION['cliente_id'])): ?>
                <span class="status ok">✓ Cliente Autenticado</span>
                <span>ID: <?= $_SESSION['cliente_id'] ?></span>
                <span>Nombre: <?= $_SESSION['cliente_nombre'] ?? 'N/A' ?></span>
            <?php elseif (isset($_SESSION['usuario_id'])): ?>
                <span class="status ok">✓ Admin Autenticado</span>
                <span>ID: <?= $_SESSION['usuario_id'] ?></span>
                <span>Rol: <?= $_SESSION['usuario_rol'] ?? 'N/A' ?></span>
            <?php else: ?>
                <span class="status warning">⚠ No Autenticado</span>
            <?php endif; ?>
        </div>

        <div class="grid">
            <?php if ($cliente_info): ?>
            <div class="card">
                <h3>Información del Cliente</h3>
                <?php if (isset($cliente_info['error'])): ?>
                    <span class="status error">Error: <?= $cliente_info['error'] ?></span>
                <?php else: ?>
                    <p><strong>ID:</strong> <?= $cliente_info['id_cliente'] ?></p>
                    <p><strong>Nombre:</strong> <?= $cliente_info['nombre'] . ' ' . $cliente_info['apellido'] ?></p>
                    <p><strong>Email:</strong> <?= $cliente_info['email'] ?></p>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <?php if ($usuario_info): ?>
            <div class="card">
                <h3>Información del Usuario Admin</h3>
                <?php if (isset($usuario_info['error'])): ?>
                    <span class="status error">Error: <?= $usuario_info['error'] ?></span>
                <?php else: ?>
                    <p><strong>ID:</strong> <?= $usuario_info['id_usuario'] ?></p>
                    <p><strong>Nombre:</strong> <?= $usuario_info['nombre'] ?></p>
                    <p><strong>Email:</strong> <?= $usuario_info['email'] ?></p>
                    <p><strong>Rol:</strong> <?= $usuario_info['rol'] ?></p>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <?php if ($carrito_info): ?>
            <div class="card">
                <h3>Información del Carrito</h3>
                <?php if (isset($carrito_info['error'])): ?>
                    <span class="status error">Error: <?= $carrito_info['error'] ?></span>
                <?php elseif ($carrito_info): ?>
                    <p><strong>ID Carrito:</strong> <?= $carrito_info['id_carrito'] ?></p>
                    <p><strong>Estado:</strong> <?= $carrito_info['estado'] ?></p>
                    <p><strong>Items:</strong> <?= $carrito_info['stats']['items'] ?? 0 ?></p>
                    <p><strong>Cantidad Total:</strong> <?= $carrito_info['stats']['total_cantidad'] ?? 0 ?></p>
                    <p><strong>Creado:</strong> <?= $carrito_info['fecha_creacion'] ?></p>
                <?php else: ?>
                    <span class="status warning">No hay carrito activo</span>
                <?php endif; ?>
            </div>
            <?php endif; ?>
        </div>

        <h2>Datos de Sesión PHP</h2>
        <pre><?= json_encode($_SESSION, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) ?></pre>

        <h2>Información Técnica</h2>
        <pre><?= json_encode($debug_info, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) ?></pre>

        <h2>Test de APIs</h2>
        <div class="actions">
            <button onclick="testAPI('session_status.php')">Test session_status.php</button>
            <button onclick="testAPI('cart_get.php')">Test cart_get.php</button>
            <button onclick="testAPI('products_list.php')">Test products_list.php</button>
        </div>
        <div id="apiResult" style="margin-top: 20px;"></div>
    </div>

    <script>
        async function testAPI(endpoint) {
            const resultDiv = document.getElementById('apiResult');
            resultDiv.innerHTML = '<p>Probando ' + endpoint + '...</p>';
            
            try {
                const response = await fetch('../api/' + endpoint, {
                    credentials: 'include'
                });
                
                const text = await response.text();
                let data;
                
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    data = text;
                }
                
                resultDiv.innerHTML = `
                    <h3>Resultado de ${endpoint}:</h3>
                    <p><strong>Status:</strong> ${response.status}</p>
                    <p><strong>Headers:</strong></p>
                    <pre>${JSON.stringify(Object.fromEntries(response.headers), null, 2)}</pre>
                    <p><strong>Response:</strong></p>
                    <pre>${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                resultDiv.innerHTML = `<span class="status error">Error: ${error.message}</span>`;
            }
        }
        
        async function testLogout() {
            if (confirm('¿Cerrar sesión?')) {
                const response = await fetch('../api/auth_logout.php', {
                    method: 'POST',
                    credentials: 'include'
                });
                
                if (response.ok) {
                    alert('Sesión cerrada');
                    window.location.reload();
                } else {
                    alert('Error al cerrar sesión');
                }
            }
        }
    </script>
</body>
</html>
