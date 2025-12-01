-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-10-2025 a las 17:05:16
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `elperrito`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `id_carrito` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `estado` enum('activo','cerrado') NOT NULL DEFAULT 'activo',
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `carrito`
--

INSERT INTO `carrito` (`id_carrito`, `id_cliente`, `estado`, `fecha_creacion`) VALUES
(6, 4, 'activo', '2025-10-08 12:23:57'),
(10, 5, 'activo', '2025-10-09 17:21:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre`, `descripcion`, `activa`) VALUES
(1, 'Alimentos', 'Comida para mascotas', 1),
(2, 'Medicinas', 'Medicamentos veterinarios', 1),
(3, 'Accesorios', 'Correas, juguetes, etc.', 1),
(4, 'Higiene', 'Productos de limpieza y aseo', 1),
(5, 'Juguetes', 'Entretenimiento para mascotas', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `email` varchar(160) NOT NULL,
  `telefono` varchar(40) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `nombre`, `apellido`, `email`, `telefono`, `direccion`, `password_hash`, `fecha_registro`, `estado`) VALUES
(1, 'xp', 'xp', 'xp@xp.com', '838757332', 'Prol. Vicente Guerrero', '$2y$10$L8UWZrglIrRyEB4KS4U95u3nLGsZziQWhLeN3GbDUrFW68T/CuCsO', '2025-10-08 11:56:44', 'activo'),
(3, 'emma', 'emma', 'emma@emma.com', '3456345', 'gsdgasdgfasdfasfd', '$2y$10$fZKXXxyqkoa.j3x75X25MuoNgdVbqZYJcGyAKlCHHn8wnQc1RfKoO', '2025-10-08 12:02:17', 'activo'),
(4, 'qq', 'qq', 'qq@qq.com', '345346346', 'sadgasdgsdgweerwe', '$2y$10$vp7hS6GfdfvS4iiF6I4bbuC1oUJ1TJ4wQS0GltY7EPyfcVlXPeYPK', '2025-10-08 12:08:09', 'activo'),
(5, 'zz', 'zz', 'zz@zz.com', '5464564', 'ghfghdfghrth', '$2y$10$HjcKsIlEmX1Gx0DJfQiFc.Yir0LNZgR5PQRHNVx1b9fKG4ZwPBZvi', '2025-10-09 17:21:25', 'activo'),
(6, 'Emmanuel', 'VO', 'emma@itvo.com', '9611160653', 'Prol. Vicente', '$2y$10$EWh4ggJVhEO2ncbo/VcbNe8xN5GoPkG7bdjS1mBU0gCd9Kg1LTDXa', '2025-10-20 11:46:03', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_carrito`
--

CREATE TABLE `detalle_carrito` (
  `id_item` int(11) NOT NULL,
  `id_carrito` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_carrito`
--

INSERT INTO `detalle_carrito` (`id_item`, `id_carrito`, `id_producto`, `cantidad`, `precio_unitario`) VALUES
(12, 10, 5, 5, 45.00),
(13, 10, 8, 5, 189.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id_detalle` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_usuario`
--

CREATE TABLE `historial_usuario` (
  `id_historial` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `campo_modificado` varchar(100) NOT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `fecha_cambio` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario_modificador` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id_producto` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id_producto`, `stock`, `stock_minimo`) VALUES
(1, 55, 5),
(2, 11, 5),
(3, 33, 5),
(4, 24, 5),
(5, 59, 5),
(6, 16, 5),
(7, 41, 5),
(8, 50, 5),
(9, 16, 5),
(10, 20, 5),
(11, 45, 5),
(12, 54, 5),
(13, 25, 5),
(14, 52, 5),
(15, 28, 5),
(16, 23, 5),
(17, 21, 5),
(18, 26, 5),
(19, 59, 5),
(20, 57, 5),
(21, 50, 5),
(22, 19, 5),
(23, 34, 5),
(24, 56, 5),
(25, 16, 5),
(26, 54, 5),
(27, 11, 5),
(28, 35, 5),
(29, 34, 5),
(30, 54, 5),
(31, 57, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(180) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `caducidad` date DEFAULT NULL,
  `id_usuario_creador` int(11) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime DEFAULT NULL,
  `es_medicamento` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `id_categoria`, `nombre`, `descripcion`, `precio_venta`, `imagen`, `caducidad`, `id_usuario_creador`, `fecha_creacion`, `fecha_modificacion`, `es_medicamento`, `activo`) VALUES
(1, 1, 'Croquetas Premium Cachorro 2kg', 'Alimento balanceado para cachorros de 2 a 12 meses. Rico en proteínas y vitaminas esenciales para el crecimiento.', 299.00, 'images/croquetas_cachorro.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(2, 1, 'Croquetas Premium Adulto 5kg', 'Alimento completo para perros adultos de todas las razas. Fórmula balanceada con omega 3 y 6.', 499.00, 'images/croquetas_adulto.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(3, 1, 'Croquetas Light 3kg', 'Alimento bajo en calorías para perros con sobrepeso. Ayuda a mantener el peso ideal.', 389.00, 'images/croquetas_light.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(4, 1, 'Alimento Húmedo Pollo 385g', 'Lata de alimento húmedo sabor pollo. Ideal para perros convalecientes o senior.', 45.00, 'images/lata_pollo.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(5, 1, 'Alimento Húmedo Res 385g', 'Lata de alimento húmedo sabor res. Receta gourmet para perros exigentes.', 45.00, 'images/lata_res.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(6, 1, 'Galletas Premio Hueso', 'Galletas en forma de hueso para premiar a tu mascota. Paquete de 500g.', 89.00, 'images/galletas_hueso.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(7, 1, 'Snacks Dentales', 'Snacks especiales para limpieza dental. Reduce el sarro y refresca el aliento.', 129.00, 'images/snacks_dental.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(8, 2, 'Antiparasitario Interno 4 tabs', 'Tabletas desparasitantes de amplio espectro. Elimina lombrices y parásitos intestinales.', 189.00, 'images/antiparasitario_tabs.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 1, 1),
(9, 2, 'Antipulgas Spray 250ml', 'Spray antipulgas de acción inmediata. Elimina pulgas, garrapatas y piojos.', 229.00, 'images/antipulgas_spray.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 1, 1),
(10, 2, 'Vitaminas Multivit 60 tabs', 'Suplemento vitamínico completo. Fortalece el sistema inmunológico.', 349.00, 'images/vitaminas.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 1, 1),
(11, 2, 'Shampoo Medicado 500ml', 'Shampoo medicado para problemas de piel. Alivia comezón y dermatitis.', 269.00, 'images/shampoo_medicado.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 1, 1),
(12, 2, 'Gotas Óticas 30ml', 'Gotas para infecciones de oído. Tratamiento antibacteriano y antimicótico.', 159.00, 'images/gotas_oido.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 1, 1),
(13, 3, 'Collar Cuero Mediano', 'Collar de cuero genuino, ajustable de 35-45cm. Herrajes resistentes.', 189.00, 'images/collar_cuero.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(14, 3, 'Correa Retráctil 5m', 'Correa retráctil de 5 metros para perros hasta 25kg. Sistema de freno automático.', 299.00, 'images/correa_retractil.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(15, 3, 'Plato Doble Antideslizante', 'Comedero doble de acero inoxidable con base antideslizante.', 149.00, 'images/plato_doble.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(16, 3, 'Cama Mediana 60cm', 'Cama acolchonada lavable, ideal para perros medianos. Material impermeable.', 599.00, 'images/cama_mediana.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(17, 3, 'Transportadora Mediana', 'Transportadora plástica con ventilación. Aprobada para viajes aéreos.', 899.00, 'images/transportadora.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(18, 3, 'Arnés Ajustable Talla M', 'Arnés ergonómico que distribuye mejor la presión. Talla mediana.', 249.00, 'images/arnes.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(19, 4, 'Shampoo Neutro 500ml', 'Shampoo pH neutro para uso frecuente. No irrita la piel sensible.', 119.00, 'images/shampoo_neutro.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(20, 4, 'Acondicionador 500ml', 'Acondicionador que desenreda y da brillo al pelaje. Aroma duradero.', 139.00, 'images/acondicionador.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(21, 4, 'Cepillo Doble Cara', 'Cepillo con cerdas suaves de un lado y peine metálico del otro.', 89.00, 'images/cepillo.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(22, 4, 'Cortauñas Profesional', 'Cortauñas de acero inoxidable con seguro. Para perros medianos y grandes.', 149.00, 'images/cortaunas.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(23, 4, 'Toallitas Húmedas 80pz', 'Toallitas húmedas hipoalalergénicas para limpieza rápida. Aroma lavanda.', 79.00, 'images/toallitas.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(24, 4, 'Perfume Perros 120ml', 'Colonia suave de larga duración. No irrita el olfato del perro.', 99.00, 'images/perfume.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(25, 5, 'Pelota Tenis Pack 3', 'Pack de 3 pelotas de tenis especiales para perros. Material resistente.', 79.00, 'images/pelotas_tenis.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(26, 5, 'Hueso Goma Grande', 'Hueso de goma termoplástica resistente. Ideal para mordedores fuertes.', 129.00, 'images/hueso_goma.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(27, 5, 'Cuerda Nudo 30cm', 'Cuerda de algodón con nudos para juego de tira y afloja.', 69.00, 'images/cuerda_nudo.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(28, 5, 'Frisbee Flotante', 'Frisbee de material suave que flota en el agua. Colores surtidos.', 89.00, 'images/frisbee.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(29, 5, 'Peluche Pato con Sonido', 'Peluche de pato que emite sonido al presionar. Material lavable.', 99.00, 'images/peluche_pato.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(30, 5, 'Kong Classic Mediano', 'Juguete Kong original rellenable. Ayuda a reducir la ansiedad.', 199.00, 'images/kong.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1),
(31, 5, 'Pelota con Luz LED', 'Pelota que se ilumina al rebotar. Ideal para jugar en la oscuridad.', 119.00, 'images/pelota_led.jpg', NULL, NULL, '2025-10-29 09:25:01', NULL, 0, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_imagen`
--

CREATE TABLE `producto_imagen` (
  `id_imagen` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `prioridad` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_actividad`
--

CREATE TABLE `registro_actividad` (
  `id_registro` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo_accion` varchar(50) NOT NULL,
  `tabla_afectada` varchar(50) NOT NULL,
  `id_registro_afectado` int(11) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `fecha_accion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `apellido` varchar(80) DEFAULT NULL,
  `email` varchar(160) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `curp` varchar(18) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(40) DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_ultima_modificacion` datetime DEFAULT NULL,
  `rol` enum('admin','operador') NOT NULL DEFAULT 'admin',
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `apellido`, `email`, `password_hash`, `curp`, `fecha_nacimiento`, `direccion`, `telefono`, `fecha_registro`, `fecha_ultima_modificacion`, `rol`, `activo`) VALUES
(1, 'Administrador', NULL, 'admin@elperrito.local', '$2y$10$knT6D6Wzv4TQq2r3Q5QnNub0iWj7gI.7y0gq0l8L8mQZp5s6b8pO2', NULL, NULL, NULL, NULL, '2025-10-29 09:25:01', NULL, 'admin', 1),
(2, 'Administrador', NULL, 'administrador@elperrito.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, NULL, NULL, '2025-10-29 09:25:01', NULL, 'admin', 1),
(9, 'Emmanuel', 'Velasquez Ortiz', 'admin123@elperrito.com', '$2y$10$8ut1OrwNzSSZXiFfUSGBTe3WowzWz2cM9c17XThRmLSeP5.cE/Mva', NULL, NULL, 'Oaxaca', '9511160653', '2025-10-30 09:56:52', NULL, 'admin', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id_venta` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `total` decimal(12,2) NOT NULL,
  `estado_pago` enum('pendiente','pagado','rechazado') NOT NULL DEFAULT 'pendiente',
  `direccion_envio` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id_carrito`),
  ADD KEY `fk_cart_cliente` (`id_cliente`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `detalle_carrito`
--
ALTER TABLE `detalle_carrito`
  ADD PRIMARY KEY (`id_item`),
  ADD KEY `fk_dcart_cart` (`id_carrito`),
  ADD KEY `fk_dcart_prod` (`id_producto`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `fk_dventa_venta` (`id_venta`),
  ADD KEY `fk_dventa_prod` (`id_producto`);

--
-- Indices de la tabla `historial_usuario`
--
ALTER TABLE `historial_usuario`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `fk_historial_usuario` (`id_usuario`),
  ADD KEY `fk_historial_modificador` (`id_usuario_modificador`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `fk_prod_cat` (`id_categoria`),
  ADD KEY `idx_producto_activo` (`activo`),
  ADD KEY `idx_producto_creador` (`id_usuario_creador`);

--
-- Indices de la tabla `producto_imagen`
--
ALTER TABLE `producto_imagen`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `fk_pimg_producto` (`id_producto`);

--
-- Indices de la tabla `registro_actividad`
--
ALTER TABLE `registro_actividad`
  ADD PRIMARY KEY (`id_registro`),
  ADD KEY `fk_registro_usuario` (`id_usuario`),
  ADD KEY `idx_fecha_accion` (`fecha_accion`),
  ADD KEY `idx_tabla_afectada` (`tabla_afectada`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_usuario_rol` (`rol`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `fk_venta_cliente` (`id_cliente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id_carrito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `detalle_carrito`
--
ALTER TABLE `detalle_carrito`
  MODIFY `id_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `historial_usuario`
--
ALTER TABLE `historial_usuario`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `producto_imagen`
--
ALTER TABLE `producto_imagen`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `registro_actividad`
--
ALTER TABLE `registro_actividad`
  MODIFY `id_registro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `fk_cart_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_carrito`
--
ALTER TABLE `detalle_carrito`
  ADD CONSTRAINT `fk_dcart_cart` FOREIGN KEY (`id_carrito`) REFERENCES `carrito` (`id_carrito`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dcart_prod` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `fk_dventa_prod` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dventa_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_usuario`
--
ALTER TABLE `historial_usuario`
  ADD CONSTRAINT `fk_historial_modificador` FOREIGN KEY (`id_usuario_modificador`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `fk_inv_prod` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `fk_prod_cat` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_producto_usuario` FOREIGN KEY (`id_usuario_creador`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto_imagen`
--
ALTER TABLE `producto_imagen`
  ADD CONSTRAINT `fk_pimg_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `registro_actividad`
--
ALTER TABLE `registro_actividad`
  ADD CONSTRAINT `fk_registro_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
