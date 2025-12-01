-- =====================================================
-- MIGRACIÓN: Convertir direcciones del perfil a direcciones_envio
-- =====================================================
-- Este script migra las direcciones existentes en el campo 'direccion'
-- de la tabla CLIENTE a la nueva tabla direccion_envio

INSERT INTO direccion_envio (
    id_cliente,
    nombre_completo,
    telefono,
    calle,
    ciudad,
    estado,
    codigo_postal,
    colonia,
    es_predeterminada
)
SELECT
    c.id_cliente,
    CONCAT(c.nombre, ' ', c.apellido) AS nombre_completo,
    COALESCE(c.telefono, 'Sin teléfono') AS telefono,
    COALESCE(c.direccion, 'Sin dirección') AS calle,
    'Por definir' AS ciudad,
    'Por definir' AS estado,
    '00000' AS codigo_postal,
    'Por definir' AS colonia,
    1 AS es_predeterminada
FROM cliente c
WHERE c.direccion IS NOT NULL
  AND c.direccion != ''
  AND NOT EXISTS (
      -- Solo migrar si el cliente no tiene direcciones guardadas
      SELECT 1 FROM direccion_envio de
      WHERE de.id_cliente = c.id_cliente
  );

-- =====================================================
-- SCRIPT COMPLETADO
-- Este script solo migra clientes que:
-- 1. Tienen una dirección en su perfil
-- 2. NO tienen direcciones en la tabla direccion_envio
-- =====================================================
