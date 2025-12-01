-- =====================================================
-- MIGRACIÓN: Sistema de Múltiples Direcciones de Envío
-- =====================================================

-- 1. Agregar campo estado_envio a la tabla VENTA (si no existe)
ALTER TABLE `venta`
ADD COLUMN IF NOT EXISTS `estado_envio` ENUM('pendiente', 'preparacion', 'enviado', 'entregado', 'cancelado')
NOT NULL DEFAULT 'pendiente'
AFTER `estado_pago`;

-- 2. Crear tabla de DIRECCION_ENVIO para múltiples direcciones por cliente
CREATE TABLE IF NOT EXISTS `direccion_envio` (
  `id_direccion` INT(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` INT(11) NOT NULL,
  `nombre_completo` VARCHAR(160) NOT NULL,
  `telefono` VARCHAR(40) NOT NULL,
  `calle` VARCHAR(255) NOT NULL,
  `numero_exterior` VARCHAR(20) DEFAULT NULL,
  `numero_interior` VARCHAR(20) DEFAULT NULL,
  `colonia` VARCHAR(100) NOT NULL,
  `ciudad` VARCHAR(100) NOT NULL,
  `estado` VARCHAR(100) NOT NULL,
  `codigo_postal` VARCHAR(10) NOT NULL,
  `referencias` TEXT DEFAULT NULL,
  `es_predeterminada` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_direccion`),
  KEY `fk_direccion_cliente` (`id_cliente`),
  CONSTRAINT `fk_direccion_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Modificar tabla VENTA para referenciar la dirección de envío
-- Cambiar direccion_envio a id_direccion_envio (FK a direccion_envio)
-- Pero mantener direccion_envio como texto para mantener compatibilidad con pedidos antiguos
ALTER TABLE `venta`
ADD COLUMN IF NOT EXISTS `id_direccion_envio` INT(11) DEFAULT NULL
AFTER `direccion_envio`,
ADD KEY IF NOT EXISTS `fk_venta_direccion` (`id_direccion_envio`);

-- No agregamos la FK para mantener flexibilidad (direcciones pueden ser eliminadas)

-- 4. Índices para optimización
CREATE INDEX IF NOT EXISTS `idx_direccion_predeterminada` ON `direccion_envio` (`id_cliente`, `es_predeterminada`);
CREATE INDEX IF NOT EXISTS `idx_venta_estado_envio` ON `venta` (`estado_envio`);

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
