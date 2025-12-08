-- ============================================================================
-- Script SQL para Renombrar Tablas de MAYÚSCULAS a minúsculas
-- Base de datos: elperrito
-- Fecha: 2025-12-07
--
-- IMPORTANTE: Este script debe ejecutarse en tu base de datos local de XAMPP
-- ANTES de subir el proyecto a producción en Hostinger
-- ============================================================================

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- RENOMBRAR TABLAS DE MAYÚSCULAS A minúsculas
-- ============================================================================

-- Tabla de productos
RENAME TABLE `PRODUCTO` TO `producto`;

-- Tabla de categorías
RENAME TABLE `CATEGORIA` TO `categoria`;

-- Tabla de clientes
RENAME TABLE `CLIENTE` TO `cliente`;

-- Tabla de carritos
RENAME TABLE `CARRITO` TO `carrito`;

-- Tabla de detalles del carrito
RENAME TABLE `DETALLE_CARRITO` TO `detalle_carrito`;

-- Tabla de detalles de venta
RENAME TABLE `DETALLE_VENTA` TO `detalle_venta`;

-- Tabla de ventas
RENAME TABLE `VENTA` TO `venta`;

-- Tabla de inventario
RENAME TABLE `INVENTARIO` TO `inventario`;

-- Tabla de usuarios
RENAME TABLE `USUARIO` TO `usuario`;

-- Tabla de historial de usuarios (si existe)
-- RENAME TABLE `HISTORIAL_USUARIO` TO `historial_usuario`;

-- Tabla de registro de actividades (si existe)
-- RENAME TABLE `REGISTRO_ACTIVIDAD` TO `registro_actividad`;

-- Tabla de direcciones (si existe)
-- RENAME TABLE `DIRECCION` TO `direccion`;

-- Tabla de direcciones de envío (si existe - probablemente ya está en minúsculas)
-- RENAME TABLE `DIRECCION_ENVIO` TO `direccion_envio`;

-- Tabla de envíos (si existe)
-- RENAME TABLE `ENVIO` TO `envio`;

-- Tabla de pagos (si existe)
-- RENAME TABLE `PAGO` TO `pago`;

-- Tabla de imágenes de producto (si existe)
-- RENAME TABLE `PRODUCTO_IMAGEN` TO `producto_imagen`;

-- Tabla de tarjetas (si existe - probablemente ya está en minúsculas)
-- RENAME TABLE `TARJETA` TO `tarjeta`;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFICACIÓN: Listar todas las tablas después del renombrado
-- ============================================================================

SHOW TABLES;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
--
-- 1. Algunas tablas pueden estar comentadas (--) porque:
--    - Ya están en minúsculas en tu base de datos
--    - No existen en tu base de datos actual
--
-- 2. Si ves el error "Table doesn't exist" al ejecutar una línea RENAME:
--    - La tabla ya está en minúsculas o no existe
--    - Simplemente ignora el error y continúa con las demás
--
-- 3. Después de ejecutar este script:
--    - Verifica que todas las tablas estén en minúsculas con: SHOW TABLES;
--    - Prueba tu aplicación localmente para asegurar que todo funcione
--
-- 4. Las claves foráneas (FOREIGN KEY) se renombran automáticamente
--    cuando renombras las tablas que las contienen
--
-- ============================================================================
