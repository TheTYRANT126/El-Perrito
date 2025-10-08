// api/products.php (esqueleto)
require __DIR__. '/../config.php'; // ajusta ruta si mueves carpetas

$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$sql = "
  SELECT p.id_producto, p.nombre, p.descripcion, p.precio_venta, p.imagen, p.activo,
  c.nombre AS categoria, i.stock
  FROM PRODUCTO p
  LEFT JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
  LEFT JOIN INVENTARIO i ON i.id_producto = p.id_producto
  WHERE p.activo = 1
AND(
      : q = '' OR
      p.nombre        LIKE CONCAT('%', : q, '%') OR
      p.descripcion   LIKE CONCAT('%', : q, '%') OR
      c.nombre        LIKE CONCAT('%', : q, '%')
)
  ORDER BY p.nombre ASC
  LIMIT 100;
";

$stmt = $pdo -> prepare($sql);
$stmt -> execute([':q' => $q]);
echo json_encode($stmt -> fetchAll(PDO:: FETCH_ASSOC));
