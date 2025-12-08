<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/cart_helpers.php';
require_login_cliente();
$cid = (int)$_SESSION['cliente_id'];

$st = $pdo->prepare("SELECT id_carrito FROM carrito WHERE id_cliente=? AND estado='activo' ORDER BY id_carrito DESC LIMIT 1");
$st->execute([$cid]);
if (!($r = $st->fetch())) { http_response_code(400); echo "CARRITO_VACIO"; exit; }
$id_carrito = (int)$r['id_carrito'];

// Obtener ID de dirección de envío (opcional, puede venir de POST)
$id_direccion_envio = isset($_POST['id_direccion_envio']) ? (int)$_POST['id_direccion_envio'] : null;

// Si el ID es 0, significa que es la dirección del perfil (no está guardada en direccion_envio)
// En este caso, usamos null para que se use la dirección del perfil del cliente
if ($id_direccion_envio === 0) {
  $id_direccion_envio = null;
}

// Si no se especifica dirección, intentar obtener la predeterminada
if (!$id_direccion_envio) {
  $st_dir = $pdo->prepare("SELECT id_direccion FROM direccion_envio WHERE id_cliente=? AND es_predeterminada=1 LIMIT 1");
  $st_dir->execute([$cid]);
  $dir_default = $st_dir->fetch();
  if ($dir_default) {
    $id_direccion_envio = (int)$dir_default['id_direccion'];
  }
}

// Obtener ID de tarjeta (opcional, puede venir de POST)
$id_tarjeta = isset($_POST['id_tarjeta']) ? (int)$_POST['id_tarjeta'] : null;

// Si no se especifica tarjeta, intentar obtener la predeterminada
if (!$id_tarjeta) {
  $st_card = $pdo->prepare("SELECT id_tarjeta FROM tarjeta WHERE id_cliente=? AND es_predeterminada=1 AND activa=1 LIMIT 1");
  $st_card->execute([$cid]);
  $card_default = $st_card->fetch();
  if ($card_default) {
    $id_tarjeta = (int)$card_default['id_tarjeta'];
  }
}

$pdo->beginTransaction();
try {
  $items = $pdo->prepare("SELECT id_producto, cantidad, precio_unitario FROM detalle_carrito WHERE id_carrito=?");
  $items->execute([$id_carrito]);
  $list = $items->fetchAll();
  if (!$list) throw new Exception('CARRITO_VACIO');

  $total = 0; foreach ($list as $it) $total += $it['precio_unitario']*$it['cantidad'];

  // Obtener dirección de envío completa si hay ID
  $direccion_envio_texto = null;
  if ($id_direccion_envio) {
    $st_dir_full = $pdo->prepare("SELECT CONCAT(calle, ' ', IFNULL(numero_exterior,''), ' ', IFNULL(numero_interior,''), ', ', colonia, ', ', ciudad, ', ', estado, ' CP ', codigo_postal) AS direccion_completa FROM direccion_envio WHERE id_direccion=?");
    $st_dir_full->execute([$id_direccion_envio]);
    $dir_data = $st_dir_full->fetch();
    if ($dir_data) {
      $direccion_envio_texto = $dir_data['direccion_completa'];
    }
  }

  // Si no hay dirección, usar la del perfil del cliente (compatibilidad con sistema anterior)
  if (!$direccion_envio_texto) {
    $st_dir = $pdo->prepare("SELECT direccion FROM cliente WHERE id_cliente=?");
    $st_dir->execute([$cid]);
    $cliente = $st_dir->fetch();
    $direccion_envio_texto = $cliente ? $cliente['direccion'] : null;
  }

  $pdo->prepare("INSERT INTO venta(id_cliente, total, estado_pago, direccion_envio, id_direccion_envio, id_tarjeta) VALUES (?, ?, 'pagado', ?, ?, ?)")->execute([$cid, $total, $direccion_envio_texto, $id_direccion_envio, $id_tarjeta]);
  $id_venta = (int)$pdo->lastInsertId();

  $insD = $pdo->prepare("INSERT INTO detalle_venta(id_venta, id_producto, cantidad, precio_unitario) VALUES (?,?,?,?)");
  foreach ($list as $it) { $insD->execute([$id_venta, $it['id_producto'], $it['cantidad'], $it['precio_unitario']]); }

  $pdo->prepare("UPDATE carrito SET estado='cerrado' WHERE id_carrito=?")->execute([$id_carrito]);

  $pdo->commit();
  echo "OK";
} catch(Throwable $e) {
  $pdo->rollBack();
  http_response_code(500);
  echo "ERROR";
}
