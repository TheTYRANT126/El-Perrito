<?php
$password = "admin123";
$hash = password_hash($password, PASSWORD_DEFAULT);
echo "Hash generado para 'admin123':<br><br>";
echo "<textarea style='width:100%; height:100px;'>$hash</textarea>";
echo "<br><br>Copia este hash y actualiza la base de datos";
?>