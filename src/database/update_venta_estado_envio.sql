-- Agregar campo estado_envio a la tabla VENTA
-- Este campo permite rastrear el estado de envío de cada pedido

ALTER TABLE `venta`
ADD COLUMN `estado_envio` ENUM('pendiente', 'preparacion', 'enviado', 'entregado', 'cancelado')
NOT NULL DEFAULT 'pendiente'
AFTER `estado_pago`;

-- Comentarios sobre los estados:
-- pendiente: Pedido recién creado, aún no procesado
-- preparacion: Pedido en proceso de preparación/empaque
-- enviado: Pedido enviado al cliente
-- entregado: Pedido entregado exitosamente
-- cancelado: Pedido cancelado (solo antes de enviarse)
