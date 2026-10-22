-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-10-2026 a las 03:09:13
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
-- Base de datos: `quorum`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `centros_formacion`
--

CREATE TABLE `centros_formacion` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `codigo` varchar(20) DEFAULT NULL,
  `regional_id` bigint(20) UNSIGNED DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `centros_formacion`
--

INSERT INTO `centros_formacion` (`id`, `nombre`, `codigo`, `regional_id`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, 'Centro de Procesos Industriales y Construcción', 'CPIC', 17, 1, '2026-04-12 16:07:38', '2026-05-18 23:43:54'),
(3, 'Centro para la Formación Cafetera', 'CFC', 17, 1, '2026-05-18 23:33:36', '2026-05-18 23:33:36'),
(4, 'Centro de Comercio y Servicios', 'CCS', 17, 1, '2026-05-18 23:33:36', '2026-05-18 23:33:36'),
(5, 'Centro Pecuario y Agroempresarial', 'CPA', 17, 1, '2026-05-18 23:33:36', '2026-05-18 23:33:36'),
(6, 'Centro de Automatización Industrial', 'CAI', 17, 1, '2026-05-18 23:33:36', '2026-05-18 23:33:36'),
(7, 'Centro nuevo', 'Cent_nuev', 16, 1, '2026-05-18 23:58:51', '2026-05-18 23:58:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `clave` varchar(100) NOT NULL,
  `valor` text DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (`id`, `clave`, `valor`, `descripcion`, `actualizado_en`) VALUES
(1, 'nombre_sistema', 'QUORUM', 'Nombre del sistema', '2026-04-12 16:07:39'),
(2, 'nombre_institucion', 'SENA - Centro CPIC', 'Nombre del centro de formación', '2026-04-12 16:07:39'),
(3, 'timeout_sesion', '30', 'Minutos de inactividad antes de cerrar sesión', '2026-04-12 16:07:39'),
(4, 'max_intentos_login', '5', 'Intentos fallidos antes de bloqueo temporal', '2026-04-12 16:07:39'),
(5, 'minutos_bloqueo', '15', 'Minutos de bloqueo tras intentos fallidos', '2026-04-12 16:07:39'),
(6, 'version', '1.0', 'Versión del sistema', '2026-04-12 16:07:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dias_festivos`
--

CREATE TABLE `dias_festivos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `descripcion` varchar(150) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `dias_festivos`
--

INSERT INTO `dias_festivos` (`id`, `fecha`, `descripcion`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, '2026-01-01', 'Año Nuevo', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(2, '2026-01-12', 'Día de los Reyes Magos', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(3, '2026-03-23', 'Día de San José', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(4, '2026-04-02', 'Jueves Santo', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(5, '2026-04-03', 'Viernes Santo', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(6, '2026-05-01', 'Día del Trabajo', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(7, '2026-05-14', 'Ascensión del Señor', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(8, '2026-06-04', 'Corpus Christi', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(9, '2026-06-11', 'Sagrado Corazón', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(10, '2026-06-29', 'San Pedro y San Pablo', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(11, '2026-07-20', 'Día de la Independencia', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(12, '2026-08-07', 'Batalla de Boyacá', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(13, '2026-08-17', 'Asunción de la Virgen', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(14, '2026-10-12', 'Día de la Raza', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(15, '2026-11-02', 'Todos los Santos', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(16, '2026-11-16', 'Independencia de Cartagena', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(17, '2026-12-08', 'Inmaculada Concepción', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39'),
(18, '2026-12-25', 'Navidad', 1, '2026-04-12 16:07:39', '2026-04-12 16:07:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fichas_caracterizacion`
--

CREATE TABLE `fichas_caracterizacion` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero_ficha` varchar(20) NOT NULL,
  `estado` enum('activa','suspendida') NOT NULL DEFAULT 'activa',
  `modalidad` enum('presencial','virtual') NOT NULL DEFAULT 'presencial',
  `centro_formacion_id` bigint(20) UNSIGNED NOT NULL,
  `programa_formacion_id` bigint(20) UNSIGNED NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `fichas_caracterizacion`
--

INSERT INTO `fichas_caracterizacion` (`id`, `numero_ficha`, `estado`, `modalidad`, `centro_formacion_id`, `programa_formacion_id`, `fecha_inicio`, `fecha_fin`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, '2929061B', 'activa', 'presencial', 1, 1, '2026-05-01', '2026-09-02', 1, '2026-04-12 18:32:43', '2026-04-27 19:21:58'),
(2, '2929061A', 'activa', 'presencial', 1, 1, '2026-04-27', '2026-08-02', 1, '2026-04-12 18:45:38', '2026-04-27 19:17:17'),
(3, '4998758A', 'activa', 'presencial', 1, 1, '2026-05-17', '2026-06-16', 1, '2026-04-14 19:18:18', '2026-05-18 21:07:07'),
(4, '4596259', 'activa', 'presencial', 1, 1, '2026-06-22', '2026-07-30', 1, '2026-06-08 20:05:32', '2026-06-08 20:05:32'),
(5, '45632569', 'activa', 'presencial', 1, 1, '2026-06-22', '2026-08-03', 1, '2026-06-08 20:13:59', '2026-06-08 20:13:59'),
(6, '45896325', 'activa', 'presencial', 1, 1, '2026-06-29', '2026-10-08', 1, '2026-06-08 21:37:32', '2026-06-08 21:37:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ficha_instructor`
--

CREATE TABLE `ficha_instructor` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ficha_id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `es_gestor` tinyint(4) NOT NULL DEFAULT 0,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ficha_instructor`
--

INSERT INTO `ficha_instructor` (`id`, `ficha_id`, `usuario_id`, `es_gestor`, `activo`, `creado_en`) VALUES
(1, 1, 4, 0, 1, '2026-04-12 18:32:43'),
(2, 1, 3, 1, 1, '2026-04-12 18:32:43'),
(3, 2, 3, 0, 1, '2026-04-12 18:45:38'),
(4, 2, 4, 1, 1, '2026-04-12 18:45:38'),
(20, 3, 4, 1, 1, '2026-04-14 19:18:18'),
(21, 3, 3, 0, 1, '2026-04-14 19:18:18'),
(22, 3, 15, 0, 1, '2026-05-18 21:05:04'),
(23, 4, 4, 0, 1, '2026-06-08 20:05:32'),
(24, 4, 3, 1, 1, '2026-06-08 20:05:32'),
(25, 4, 27, 0, 1, '2026-06-08 20:05:32'),
(26, 4, 15, 0, 1, '2026-06-08 20:06:48'),
(27, 5, 28, 1, 1, '2026-06-08 20:13:59'),
(28, 5, 15, 0, 1, '2026-06-08 20:13:59'),
(29, 5, 4, 0, 1, '2026-06-08 20:13:59'),
(30, 6, 39, 1, 1, '2026-06-08 21:37:32'),
(31, 6, 28, 0, 1, '2026-06-08 21:37:49');

--
-- Disparadores `ficha_instructor`
--
DELIMITER $$
CREATE TRIGGER `trg_un_gestor_por_ficha` BEFORE INSERT ON `ficha_instructor` FOR EACH ROW BEGIN
                IF NEW.es_gestor = 1 THEN
                    IF EXISTS (
                        SELECT 1 FROM ficha_instructor
                        WHERE ficha_id = NEW.ficha_id
                          AND es_gestor = 1
                          AND activo    = 1
                    ) THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Esta ficha ya tiene un Gestor de Grupo asignado.';
                    END IF;
                END IF;
            END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_un_gestor_por_ficha_update` BEFORE UPDATE ON `ficha_instructor` FOR EACH ROW BEGIN
                IF NEW.es_gestor = 1 AND (OLD.es_gestor = 0 OR OLD.activo = 0) THEN
                    IF EXISTS (
                        SELECT 1 FROM ficha_instructor
                        WHERE ficha_id = NEW.ficha_id
                          AND es_gestor = 1
                          AND activo    = 1
                          AND id        != NEW.id
                    ) THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Esta ficha ya tiene un Gestor de Grupo asignado.';
                    END IF;
                END IF;
            END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_actividad`
--

CREATE TABLE `historial_actividad` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED DEFAULT NULL,
  `accion` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `historial_actividad`
--

INSERT INTO `historial_actividad` (`id`, `usuario_id`, `accion`, `descripcion`, `ip`, `creado_en`) VALUES
(1, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-13 00:26:46'),
(2, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-13 00:50:06'),
(3, 1, 'desactivar_centro_formacion', 'Centro id 2 — Centro de Procesos Industriales y Construcción', '127.0.0.1', '2026-04-13 00:55:45'),
(4, 1, 'eliminar_centro_formacion', 'Id 2', '127.0.0.1', '2026-04-13 00:55:54'),
(5, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-04-13 01:10:20'),
(6, 4, 'login_exitoso', 'Staff: mgomez@sena.edu.co', '127.0.0.1', '2026-04-13 01:11:46'),
(7, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co', '127.0.0.1', '2026-04-13 01:13:52'),
(8, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-13 01:16:14'),
(9, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-13 18:22:33'),
(10, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-13 18:36:17'),
(11, 3, 'guardar_asistencia', 'Sesión id 4 — ficha 2 — fecha 2026-04-13', '127.0.0.1', '2026-04-13 18:43:20'),
(12, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-13 18:46:44'),
(13, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-13 23:35:33'),
(14, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-13 23:36:30'),
(15, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-13 23:44:35'),
(16, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-13 23:51:27'),
(17, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-13 23:55:15'),
(18, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 00:01:14'),
(19, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 00:08:20'),
(20, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 00:13:09'),
(21, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 00:19:25'),
(22, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 00:20:31'),
(23, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 00:23:52'),
(24, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 00:31:16'),
(25, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 00:36:18'),
(26, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 00:42:57'),
(27, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 00:46:10'),
(28, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 00:47:25'),
(29, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 18:24:40'),
(30, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 18:24:57'),
(31, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 18:42:26'),
(32, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 18:48:13'),
(33, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 18:49:43'),
(34, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 18:56:27'),
(35, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 18:59:35'),
(36, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 19:13:31'),
(37, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 19:14:21'),
(38, 1, 'desactivar_ficha', 'Ficha 2929061B (id 1)', '127.0.0.1', '2026-04-14 19:16:56'),
(39, 1, 'crear_ficha', 'Ficha 4998758A (id 3)', '127.0.0.1', '2026-04-14 19:18:18'),
(40, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 19:19:35'),
(41, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 19:21:28'),
(42, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 19:22:47'),
(43, 1, 'actualizar_ficha', 'Ficha 4998758A (id 3)', '127.0.0.1', '2026-04-14 19:23:20'),
(44, 1, 'actualizar_ficha', 'Ficha 4998758A (id 3)', '127.0.0.1', '2026-04-14 19:23:32'),
(45, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 19:24:04'),
(46, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 19:25:24'),
(47, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 19:26:12'),
(48, 1, 'importar_aprendices', 'Ficha id 3 — 4998758A', '127.0.0.1', '2026-04-14 19:27:41'),
(49, 1, 'importar_aprendices', 'Ficha id 3 — 4998758A', '127.0.0.1', '2026-04-14 19:29:10'),
(50, 1, 'importar_aprendices', 'Ficha id 3 — 4998758A', '127.0.0.1', '2026-04-14 19:29:48'),
(51, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 19:30:55'),
(52, 3, 'guardar_asistencia', 'Sesión id 5 — ficha 3 — fecha 2026-04-14', '127.0.0.1', '2026-04-14 19:46:41'),
(53, 3, 'corregir_asistencia', 'Registro id 21 — aprendiz 20', '127.0.0.1', '2026-04-14 19:47:05'),
(54, 3, 'corregir_asistencia', 'Registro id 21 — aprendiz 20', '127.0.0.1', '2026-04-14 19:47:16'),
(55, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-04-01 a 2026-04-30', '127.0.0.1', '2026-04-14 19:49:07'),
(56, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 19:55:22'),
(57, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 22:02:22'),
(58, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 22:40:51'),
(59, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 22:45:06'),
(60, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 22:46:48'),
(61, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 23:07:39'),
(62, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 23:11:44'),
(63, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 23:20:09'),
(64, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-14 23:22:49'),
(65, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-14 23:23:06'),
(66, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co', '127.0.0.1', '2026-04-14 23:25:43'),
(67, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-27 18:26:18'),
(68, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-27 18:34:25'),
(69, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-04-27 18:41:02'),
(70, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 18:42:15'),
(71, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 18:43:17'),
(72, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 18:45:46'),
(73, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 18:46:17'),
(74, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co', '127.0.0.1', '2026-04-27 18:46:48'),
(75, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 18:48:53'),
(76, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 18:50:16'),
(77, 4, 'login_exitoso', 'Staff: mgomez@sena.edu.co', '127.0.0.1', '2026-04-27 18:53:05'),
(78, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-04-27 18:56:25'),
(79, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 18:57:15'),
(80, 19, 'login_exitoso', 'Aprendiz: sg2@gmail.com', '127.0.0.1', '2026-04-27 19:00:00'),
(81, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co', '127.0.0.1', '2026-04-27 19:00:57'),
(82, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co', '127.0.0.1', '2026-04-27 19:01:22'),
(83, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-27 19:04:12'),
(84, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 19:05:06'),
(85, 1, 'actualizar_ficha', 'Ficha 2929061A (id 2)', '127.0.0.1', '2026-04-27 19:17:17'),
(86, 1, 'reactivar_ficha', 'Ficha 2929061B (id 1)', '127.0.0.1', '2026-04-27 19:21:45'),
(87, 1, 'actualizar_ficha', 'Ficha 2929061B (id 1)', '127.0.0.1', '2026-04-27 19:21:58'),
(88, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 19:30:07'),
(89, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-04-27 19:31:06'),
(90, 3, 'guardar_asistencia', 'Sesión id 8 — ficha 2 — fecha 2026-04-27', '127.0.0.1', '2026-04-27 19:35:13'),
(91, 3, 'corregir_asistencia', 'Registro id 29 — aprendiz 7', '127.0.0.1', '2026-04-27 19:36:30'),
(92, 3, 'descargar_reporte_excel', 'Ficha 2929061A — 2026-04-01 a 2026-04-30', '127.0.0.1', '2026-04-27 19:36:55'),
(93, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 19:41:30'),
(94, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-04-27 19:51:58'),
(95, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-04-27 19:52:56'),
(96, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-05-02 09:28:46'),
(97, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-05-02 11:18:33'),
(98, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-05-02 11:49:56'),
(99, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-05-02 11:50:47'),
(100, 19, 'login_exitoso', 'Aprendiz: sg2@gmail.com', '127.0.0.1', '2026-05-02 11:51:26'),
(101, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', '2026-05-02 11:58:52'),
(102, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-05-02 12:00:09'),
(103, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-05-02 12:00:27'),
(104, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-04-01 a 2026-05-31', '127.0.0.1', '2026-05-02 12:01:21'),
(105, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-04-01 a 2026-05-31', '127.0.0.1', '2026-05-02 12:02:54'),
(106, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-05-02 12:44:25'),
(107, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-04-01 a 2026-05-31', '127.0.0.1', '2026-05-02 12:45:04'),
(108, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com', '127.0.0.1', '2026-05-02 12:46:44'),
(109, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-04-01 a 2026-05-31', '127.0.0.1', '2026-05-02 12:47:08'),
(110, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-04-01 a 2026-05-31', '127.0.0.1', '2026-05-02 12:51:20'),
(111, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-04-01 a 2026-05-31', '127.0.0.1', '2026-05-02 12:56:49'),
(112, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 18:39:36'),
(113, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 18:56:17'),
(114, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 19:06:24'),
(115, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 19:22:53'),
(116, 4, 'login_exitoso', 'Staff: mgomez@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-05-02 19:23:33'),
(117, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 19:30:56'),
(118, 1, 'actualizar_ficha', 'Ficha 4998758A (id 3)', '127.0.0.1', '2026-05-02 19:31:28'),
(119, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 19:34:25'),
(120, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 19:35:22'),
(121, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 19:47:10'),
(122, 3, 'guardar_asistencia', 'Sesión id 9 — ficha 3 — fecha 2026-05-02', '127.0.0.1', '2026-05-02 19:50:11'),
(123, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 19:56:57'),
(124, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 20:01:04'),
(125, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 20:06:18'),
(126, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 20:18:47'),
(127, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 20:19:35'),
(128, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 20:32:38'),
(129, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 20:39:11'),
(130, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 20:59:36'),
(131, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 21:07:13'),
(132, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 21:19:09'),
(133, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 21:31:23'),
(134, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 21:50:01'),
(135, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 22:09:12'),
(136, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 22:09:24'),
(137, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-02 22:10:18'),
(138, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-03 01:24:29'),
(139, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-04 19:03:56'),
(140, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-04 19:05:52'),
(141, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-04 19:06:50'),
(142, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-04 19:25:48'),
(143, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-04 19:27:24'),
(144, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-04 19:28:26'),
(145, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-04 19:30:40'),
(146, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-04 19:33:24'),
(147, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-05 18:29:52'),
(148, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-05 18:35:50'),
(149, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-12 20:41:09'),
(150, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-12 20:50:42'),
(151, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-15 20:04:24'),
(152, 1, 'actualizar_ficha', 'Ficha 4998758A (id 3)', '127.0.0.1', '2026-05-15 20:06:04'),
(153, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-15 20:06:30'),
(154, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-16 10:13:50'),
(155, 3, 'guardar_asistencia', 'Sesión id 12 — ficha 3 — fecha 2026-05-16', '127.0.0.1', '2026-05-16 10:15:47'),
(156, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-05-01 a 2026-05-31', '127.0.0.1', '2026-05-16 10:16:23'),
(157, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-16 10:18:44'),
(158, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-05-16 10:22:38'),
(159, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 20:14:14'),
(160, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-03-01 a 2026-05-31', '127.0.0.1', '2026-05-18 20:29:30'),
(161, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 20:58:50'),
(162, 1, 'actualizar_ficha', 'Ficha 4998758A (id 3)', '127.0.0.1', '2026-05-18 21:05:04'),
(163, 1, 'actualizar_ficha', 'Ficha 4998758A (id 3)', '127.0.0.1', '2026-05-18 21:07:07'),
(164, 1, 'actualizar_ficha', 'Ficha 4998758A (id 3)', '127.0.0.1', '2026-05-18 21:07:18'),
(165, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 21:42:03'),
(166, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 21:42:35'),
(167, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 21:47:06'),
(168, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-05-18 22:07:00'),
(169, 4, 'login_exitoso', 'Staff: mgomez@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-05-18 22:10:33'),
(170, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-05-18 22:10:45'),
(171, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 22:11:19'),
(172, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 22:11:33'),
(173, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 22:11:58'),
(174, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 22:37:36'),
(175, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 22:43:18'),
(176, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 22:45:37'),
(177, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 22:55:33'),
(178, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 22:55:55'),
(179, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 23:19:38'),
(180, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-18 23:30:17'),
(181, 1, 'crear_centro_formacion', 'Centro: Centro nuevo (id 7)', '127.0.0.1', '2026-05-18 23:58:51'),
(182, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-19 00:09:01'),
(183, 3, 'guardar_asistencia', 'Sesión id 13 — ficha 2 — fecha 2026-05-18', '127.0.0.1', '2026-05-19 00:11:47'),
(184, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-19 20:39:29'),
(185, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-25 18:43:51'),
(186, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-25 18:46:16'),
(187, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-25 19:43:27'),
(188, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-25 19:44:22'),
(189, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-05-25 19:55:08'),
(190, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-25 19:55:59'),
(191, 8, 'login_exitoso', 'Aprendiz: cc@gmail.com', '127.0.0.1', '2026-05-25 19:57:03'),
(192, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-26 19:51:22'),
(193, 3, 'guardar_asistencia', 'Sesión id 16 — ficha 3 — fecha 2026-05-26', '127.0.0.1', '2026-05-26 19:53:29'),
(194, 19, 'login_exitoso', 'Aprendiz: sg2@gmail.com', '127.0.0.1', '2026-05-26 20:25:35'),
(195, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-26 20:25:52'),
(196, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-26 20:38:42'),
(197, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 18:24:02'),
(198, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 18:34:44'),
(199, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 18:35:57'),
(200, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-05-01 a 2026-05-31', '127.0.0.1', '2026-05-27 18:38:53'),
(201, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-05-01 a 2026-05-31', '127.0.0.1', '2026-05-27 18:39:04'),
(202, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-05-01 a 2026-05-31', '127.0.0.1', '2026-05-27 18:39:29'),
(203, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 18:55:42'),
(204, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-05-01 a 2026-05-31', '127.0.0.1', '2026-05-27 18:56:00'),
(205, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-05-01 a 2026-05-31', '127.0.0.1', '2026-05-27 18:56:10'),
(206, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 19:30:24'),
(207, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 20:18:07'),
(208, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 20:18:40'),
(209, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 20:42:10'),
(210, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 20:43:09'),
(211, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 20:52:16'),
(212, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 20:52:39'),
(213, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 20:58:22'),
(214, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-27 21:04:56'),
(215, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-28 18:25:58'),
(216, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-28 18:29:54'),
(217, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-28 19:05:41'),
(218, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-28 19:32:20'),
(219, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-28 20:26:58'),
(220, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-05-28 20:39:43'),
(221, 2, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-05-01 a 2026-05-31', '127.0.0.1', '2026-05-28 20:40:22'),
(222, 4, 'login_exitoso', 'Staff: mgomez@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-05-28 20:45:25'),
(223, 4, 'guardar_asistencia', 'Sesión id 20 — ficha 2 — fecha 2026-05-19', '127.0.0.1', '2026-05-28 20:48:36'),
(224, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-05-28 20:53:49'),
(225, 8, 'login_exitoso', 'Aprendiz: cc@gmail.com', '127.0.0.1', '2026-05-28 20:58:47'),
(226, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-29 18:09:21'),
(227, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-29 18:09:52'),
(228, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-29 18:15:16'),
(229, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-29 18:15:26'),
(230, 3, 'guardar_asistencia', 'Sesión id 21 — ficha 3 — fecha 2026-05-29', '127.0.0.1', '2026-05-29 18:18:35'),
(231, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-29 18:49:43'),
(232, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-29 18:56:52'),
(233, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-05-29 19:02:49'),
(234, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-01 18:12:12'),
(235, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-01 18:12:24'),
(236, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-03-01 a 2026-06-30', '127.0.0.1', '2026-06-01 18:14:32'),
(237, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-01 18:29:18'),
(238, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-02 18:26:49'),
(239, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-02 18:28:53'),
(240, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-02 18:29:30'),
(241, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-02 18:32:18'),
(242, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-06-01 a 2026-06-30', '127.0.0.1', '2026-06-02 18:33:01'),
(243, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-04-01 a 2026-06-30', '127.0.0.1', '2026-06-02 18:34:11'),
(244, 3, 'descargar_reporte_excel', 'Ficha 4998758A — 2026-04-01 a 2026-06-30', '127.0.0.1', '2026-06-02 18:34:33'),
(245, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-02 19:20:48'),
(246, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-02 20:56:24'),
(247, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-02 20:56:46'),
(248, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 14:48:24'),
(249, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 14:50:23'),
(250, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-06-07 14:50:40'),
(251, 4, 'login_exitoso', 'Staff: mgomez@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-06-07 14:50:58'),
(252, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-06-07 14:51:24'),
(253, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 16:26:25'),
(254, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 16:26:36'),
(255, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 16:26:55'),
(256, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 16:27:31'),
(257, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 16:58:36'),
(258, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 17:00:41'),
(259, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 17:50:07'),
(260, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 17:52:57'),
(261, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 17:53:51'),
(262, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 17:55:41'),
(263, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-07 18:28:26'),
(264, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 11:11:52'),
(265, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 11:12:30'),
(266, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-06-08 11:14:03'),
(267, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 14:02:26'),
(268, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 14:02:48'),
(269, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 14:12:25'),
(270, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 14:13:18'),
(271, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-06-08 14:18:45'),
(272, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 14:33:59'),
(273, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 14:51:19'),
(274, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-06-08 15:02:20'),
(275, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 19:16:16'),
(276, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 19:32:35'),
(277, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 19:59:37'),
(278, 1, 'crear_usuario', 'cmarin@sena.edu.co — rol instructor', '127.0.0.1', '2026-06-08 20:01:51'),
(279, 1, 'crear_ficha', 'Ficha 4596259 (id 4)', '127.0.0.1', '2026-06-08 20:05:32'),
(280, 1, 'asignar_instructor_ficha', 'Ficha id 4 — acción asignar', '127.0.0.1', '2026-06-08 20:06:48'),
(281, 1, 'asignar_instructor_ficha', 'Ficha id 4 — acción asignar', '127.0.0.1', '2026-06-08 20:06:51'),
(282, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 20:09:46'),
(283, 1, 'crear_usuario', 'gangarita@sena.edu.co — rol instructor', '127.0.0.1', '2026-06-08 20:11:07'),
(284, 1, 'crear_ficha', 'Ficha 45632569 (id 5)', '127.0.0.1', '2026-06-08 20:13:59'),
(285, 1, 'importar_aprendices', 'Ficha id 5 — 45632569', '127.0.0.1', '2026-06-08 20:14:41'),
(286, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-06-08 20:19:21'),
(287, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 20:23:51'),
(288, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 21:05:31'),
(289, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 21:10:32'),
(290, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 21:14:48'),
(291, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 21:22:04'),
(292, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 21:25:01'),
(293, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 21:29:06'),
(294, 1, 'crear_usuario', 'mvilla@sena.edu.co — rol instructor', '127.0.0.1', '2026-06-08 21:30:42'),
(295, 1, 'actualizar_usuario', 'Id 38 — gperez@sena.edu.co', '127.0.0.1', '2026-06-08 21:32:21'),
(296, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 21:33:43'),
(297, 1, 'crear_usuario', 'mvilla@sena.edu.co — rol instructor', '127.0.0.1', '2026-06-08 21:35:19'),
(298, 1, 'crear_ficha', 'Ficha 45896325 (id 6)', '127.0.0.1', '2026-06-08 21:37:32'),
(299, 1, 'asignar_instructor_ficha', 'Ficha id 6 — acción asignar', '127.0.0.1', '2026-06-08 21:37:49'),
(300, 1, 'importar_aprendices', 'Ficha id 6 — 45896325', '127.0.0.1', '2026-06-08 21:38:43'),
(301, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-06-08 21:42:16'),
(302, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 21:44:12'),
(303, 3, 'guardar_asistencia', 'Sesión id 24 — ficha 2 — fecha 2026-05-11', '127.0.0.1', '2026-06-08 21:46:47'),
(304, 3, 'descargar_reporte_excel', 'Ficha 2929061A — 2026-03-16 a 2026-06-30', '127.0.0.1', '2026-06-08 21:47:52'),
(305, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-08 21:50:43'),
(306, 3, 'guardar_asistencia', 'Sesión id 25 — ficha 2 — fecha 2026-06-08', '127.0.0.1', '2026-06-08 21:51:56'),
(307, 5, 'login_exitoso', 'Aprendiz: andres@aprendiz.sena.edu.co', '127.0.0.1', '2026-06-08 21:52:37'),
(308, 8, 'login_exitoso', 'Aprendiz: cc@gmail.com', '127.0.0.1', '2026-06-08 21:53:08'),
(309, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-10 12:48:02'),
(310, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-10 13:00:04'),
(311, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-10 13:01:02'),
(312, 2, 'login_exitoso', 'Staff: sbecerra@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-06-10 13:10:06'),
(313, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-10 13:46:10'),
(314, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-10 14:13:50'),
(315, 3, 'guardar_asistencia', 'Sesión id 27 — ficha 3 — fecha 2026-06-06', '127.0.0.1', '2026-06-10 14:14:19'),
(316, 4, 'login_exitoso', 'Staff: mgomez@sena.edu.co (TOTP bypass local)', '127.0.0.1', '2026-06-10 14:41:42'),
(317, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-10 14:41:51'),
(318, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-10 17:05:44'),
(319, 3, 'login_exitoso', 'Staff: documentosorozco25@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-10 17:05:59'),
(320, 1, 'login_exitoso', 'Staff: andresfelipeorozcopiedrahita@gmail.com (TOTP bypass local)', '127.0.0.1', '2026-06-10 17:43:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ficha_id` bigint(20) UNSIGNED NOT NULL,
  `jornada_ficha_id` bigint(20) UNSIGNED NOT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `horas_programadas` tinyint(3) UNSIGNED NOT NULL,
  `instructor_id` bigint(20) UNSIGNED NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`id`, `ficha_id`, `jornada_ficha_id`, `dia_semana`, `hora_inicio`, `hora_fin`, `horas_programadas`, `instructor_id`, `activo`, `creado_en`, `actualizado_en`) VALUES
(21, 2, 11, 'lunes', '18:00:00', '22:00:00', 4, 3, 1, '2026-04-27 19:17:17', '2026-04-27 19:17:17'),
(22, 2, 11, 'martes', '18:00:00', '22:00:00', 4, 4, 1, '2026-04-27 19:17:17', '2026-04-27 19:17:17'),
(23, 1, 12, 'lunes', '18:00:00', '22:00:00', 4, 4, 1, '2026-04-27 19:21:58', '2026-04-27 19:21:58'),
(24, 1, 12, 'martes', '18:00:00', '22:00:00', 4, 3, 1, '2026-04-27 19:21:58', '2026-04-27 19:21:58'),
(28, 3, 14, 'lunes', '12:00:00', '16:00:00', 4, 4, 1, '2026-05-15 20:06:04', '2026-05-15 20:06:04'),
(29, 3, 14, 'martes', '00:00:00', '16:00:00', 16, 3, 1, '2026-05-15 20:06:04', '2026-05-15 20:06:04'),
(30, 3, 14, 'sabado', '08:00:00', '12:00:00', 4, 3, 1, '2026-05-15 20:06:04', '2026-05-15 20:06:04'),
(31, 3, 14, 'viernes', '18:00:00', '22:00:00', 4, 3, 1, '2026-05-15 20:06:04', '2026-05-15 20:06:04'),
(32, 3, 14, 'jueves', '08:00:00', '12:00:00', 4, 4, 1, '2026-05-18 21:05:04', '2026-05-18 21:05:04'),
(33, 4, 15, 'lunes', '18:00:00', '22:00:00', 4, 27, 1, '2026-06-08 20:05:32', '2026-06-08 20:05:32'),
(34, 4, 15, 'martes', '18:00:00', '22:00:00', 4, 27, 1, '2026-06-08 20:05:32', '2026-06-08 20:05:32'),
(35, 4, 15, 'miercoles', '18:00:00', '22:00:00', 4, 27, 1, '2026-06-08 20:05:32', '2026-06-08 20:05:32'),
(36, 4, 15, 'jueves', '18:00:00', '22:00:00', 4, 27, 1, '2026-06-08 20:05:32', '2026-06-08 20:05:32'),
(37, 4, 15, 'viernes', '18:00:00', '22:00:00', 4, 27, 1, '2026-06-08 20:05:32', '2026-06-08 20:05:32'),
(38, 4, 15, 'sabado', '08:00:00', '12:00:00', 4, 27, 1, '2026-06-08 20:05:32', '2026-06-08 20:05:32'),
(39, 5, 16, 'lunes', '18:00:00', '22:00:00', 4, 28, 1, '2026-06-08 20:13:59', '2026-06-08 20:13:59'),
(40, 5, 16, 'martes', '18:00:00', '22:00:00', 4, 28, 1, '2026-06-08 20:13:59', '2026-06-08 20:13:59'),
(41, 5, 16, 'miercoles', '18:00:00', '22:00:00', 4, 28, 1, '2026-06-08 20:13:59', '2026-06-08 20:13:59'),
(42, 5, 16, 'jueves', '18:00:00', '22:00:00', 4, 28, 1, '2026-06-08 20:13:59', '2026-06-08 20:13:59'),
(43, 5, 16, 'viernes', '18:00:00', '22:00:00', 4, 28, 1, '2026-06-08 20:13:59', '2026-06-08 20:13:59'),
(44, 5, 16, 'sabado', '08:00:00', '12:00:00', 4, 28, 1, '2026-06-08 20:13:59', '2026-06-08 20:13:59'),
(45, 6, 17, 'lunes', '18:00:00', '22:00:00', 4, 39, 1, '2026-06-08 21:37:32', '2026-06-08 21:37:32'),
(46, 6, 17, 'martes', '18:00:00', '22:00:00', 4, 39, 1, '2026-06-08 21:37:32', '2026-06-08 21:37:32'),
(47, 6, 17, 'miercoles', '18:00:00', '22:00:00', 4, 39, 1, '2026-06-08 21:37:32', '2026-06-08 21:37:32'),
(48, 6, 17, 'jueves', '18:00:00', '22:00:00', 4, 39, 1, '2026-06-08 21:37:32', '2026-06-08 21:37:32'),
(49, 6, 17, 'viernes', '18:00:00', '22:00:00', 4, 39, 1, '2026-06-08 21:37:32', '2026-06-08 21:37:32'),
(50, 6, 17, 'sabado', '08:00:00', '12:00:00', 4, 39, 1, '2026-06-08 21:37:32', '2026-06-08 21:37:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `importaciones_aprendices`
--

CREATE TABLE `importaciones_aprendices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `importado_por` bigint(20) UNSIGNED NOT NULL,
  `ficha_id` bigint(20) UNSIGNED NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `total_registros` int(11) NOT NULL DEFAULT 0,
  `exitosos` int(11) NOT NULL DEFAULT 0,
  `fallidos` int(11) NOT NULL DEFAULT 0,
  `errores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`errores`)),
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `importaciones_aprendices`
--

INSERT INTO `importaciones_aprendices` (`id`, `importado_por`, `ficha_id`, `nombre_archivo`, `total_registros`, `exitosos`, `fallidos`, `errores`, `creado_en`) VALUES
(1, 1, 2, 'Usuarios_lista.xlsx', 9, 9, 0, '[]', '2026-04-12 18:59:26'),
(2, 1, 3, 'Usuarios_lista.xlsx', 9, 0, 9, '[\"Fila 2: El correo ya est\\u00e1 registrado en el sistema.\",\"Fila 3: El correo ya est\\u00e1 registrado en el sistema.\",\"Fila 4: El correo ya est\\u00e1 registrado en el sistema.\",\"Fila 5: El correo ya est\\u00e1 registrado en el sistema.\",\"Fila 6: El correo ya est\\u00e1 registrado en el sistema.\",\"Fila 7: El correo ya est\\u00e1 registrado en el sistema.\",\"Fila 8: El correo ya est\\u00e1 registrado en el sistema.\",\"Fila 9: El correo ya est\\u00e1 registrado en el sistema.\",\"Fila 10: El correo ya est\\u00e1 registrado en el sistema.\"]', '2026-04-14 19:27:41'),
(3, 1, 3, 'Usuarios_lista.xlsx', 9, 0, 9, '[\"Fila 2: La c\\u00e9dula ya est\\u00e1 registrada en el sistema.\",\"Fila 3: La c\\u00e9dula ya est\\u00e1 registrada en el sistema.\",\"Fila 4: La c\\u00e9dula ya est\\u00e1 registrada en el sistema.\",\"Fila 5: La c\\u00e9dula ya est\\u00e1 registrada en el sistema.\",\"Fila 6: La c\\u00e9dula ya est\\u00e1 registrada en el sistema.\",\"Fila 7: La c\\u00e9dula ya est\\u00e1 registrada en el sistema.\",\"Fila 8: La c\\u00e9dula ya est\\u00e1 registrada en el sistema.\",\"Fila 9: La c\\u00e9dula ya est\\u00e1 registrada en el sistema.\",\"Fila 10: La c\\u00e9dula ya est\\u00e1 registrada en el sistema.\"]', '2026-04-14 19:29:10'),
(4, 1, 3, 'Usuarios_lista.xlsx', 9, 9, 0, '[]', '2026-04-14 19:29:48'),
(5, 1, 5, 'Usuarios_lista.xlsx', 9, 9, 0, '[]', '2026-06-08 20:14:41'),
(6, 1, 6, 'Usuarios_lista.xlsx', 9, 9, 0, '[]', '2026-06-08 21:38:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `intentos_login`
--

CREATE TABLE `intentos_login` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `correo` varchar(150) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `exitoso` tinyint(4) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `intentos_login`
--

INSERT INTO `intentos_login` (`id`, `correo`, `ip`, `exitoso`, `creado_en`) VALUES
(1, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-12 16:10:30'),
(2, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-12 16:15:41'),
(3, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-12 16:20:27'),
(4, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 16:38:40'),
(5, 'documentosorozco25@gmail.com', '127.0.0.1', 0, '2026-04-12 16:40:19'),
(6, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-12 16:42:48'),
(7, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-04-12 16:44:56'),
(8, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-04-12 16:45:07'),
(9, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 16:47:54'),
(10, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 17:02:44'),
(11, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 17:20:39'),
(12, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 0, '2026-04-12 17:32:56'),
(13, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 17:33:14'),
(14, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-04-12 17:35:25'),
(15, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-12 17:36:42'),
(16, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-04-12 17:37:29'),
(17, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 17:38:33'),
(18, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 18:14:06'),
(19, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 18:15:06'),
(20, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 18:22:48'),
(21, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 18:26:33'),
(22, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 18:53:49'),
(23, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 19:55:29'),
(24, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 20:04:14'),
(25, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-12 20:34:02'),
(26, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 20:34:58'),
(27, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-12 20:38:44'),
(28, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-12 20:50:16'),
(29, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 20:52:58'),
(30, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-12 20:53:51'),
(31, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 20:56:19'),
(32, 'mgomez@sena.edu.co', '127.0.0.1', 0, '2026-04-12 20:57:07'),
(33, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-04-12 20:57:26'),
(34, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-04-12 21:16:54'),
(35, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 22:15:59'),
(36, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-04-12 22:23:57'),
(37, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 22:44:26'),
(38, 'dg@gmail.com', '127.0.0.1', 0, '2026-04-12 22:51:51'),
(39, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 23:11:33'),
(40, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-12 23:29:21'),
(41, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-13 00:26:46'),
(42, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-13 00:50:06'),
(43, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-04-13 01:11:46'),
(44, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-04-13 01:13:52'),
(45, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-13 01:16:14'),
(46, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-13 18:22:33'),
(47, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-13 18:36:17'),
(48, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-13 18:46:44'),
(49, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-13 23:35:33'),
(50, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-13 23:36:30'),
(51, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-13 23:44:35'),
(52, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-13 23:51:27'),
(53, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-13 23:55:15'),
(54, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 00:01:14'),
(55, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 00:08:20'),
(56, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 00:13:09'),
(57, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 00:19:25'),
(58, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 00:20:31'),
(59, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 00:23:52'),
(60, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 00:31:16'),
(61, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 00:36:18'),
(62, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 00:42:57'),
(63, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 00:46:10'),
(64, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 00:47:25'),
(65, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 18:24:40'),
(66, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 18:24:57'),
(67, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 18:42:26'),
(68, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 18:48:13'),
(69, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 18:49:43'),
(70, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 18:56:27'),
(71, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 18:59:35'),
(72, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 19:13:31'),
(73, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 19:14:21'),
(74, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 19:19:35'),
(75, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 19:21:28'),
(76, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 19:22:47'),
(77, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 19:24:04'),
(78, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 19:25:24'),
(79, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 19:26:12'),
(80, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 19:30:55'),
(81, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 19:55:22'),
(82, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 22:02:22'),
(83, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 22:40:51'),
(84, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 22:45:06'),
(85, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 22:46:48'),
(86, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 23:07:39'),
(87, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 23:11:44'),
(88, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 23:20:09'),
(89, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-14 23:22:49'),
(90, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-14 23:23:06'),
(91, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-04-14 23:25:43'),
(92, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-27 18:26:18'),
(93, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-27 18:34:25'),
(94, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 18:42:15'),
(95, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 18:43:17'),
(96, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 18:45:46'),
(97, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 18:46:17'),
(98, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-04-27 18:46:48'),
(99, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 18:48:53'),
(100, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 18:50:16'),
(101, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-04-27 18:53:05'),
(102, 'andres@aprendiz.sena.edu.co', '127.0.0.1', 0, '2026-04-27 18:56:07'),
(103, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 18:57:15'),
(104, 'sg2@gmail.com', '127.0.0.1', 0, '2026-04-27 18:59:36'),
(105, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-04-27 19:00:57'),
(106, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-04-27 19:01:22'),
(107, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-27 19:04:12'),
(108, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 19:05:06'),
(109, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 19:30:07'),
(110, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-04-27 19:31:06'),
(111, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 19:41:30'),
(112, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-04-27 19:52:56'),
(113, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-02 09:28:46'),
(114, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-02 11:18:33'),
(115, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-02 11:49:56'),
(116, 'andres@aprendiz.sena.edu.co', '127.0.0.1', 1, '2026-05-02 11:50:47'),
(117, 'sg2@gmail.com', '127.0.0.1', 1, '2026-05-02 11:51:26'),
(118, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-02 11:58:52'),
(119, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 12:00:09'),
(120, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 12:00:27'),
(121, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 12:44:25'),
(122, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 12:46:44'),
(123, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-02 18:39:36'),
(124, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-02 18:56:17'),
(125, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-02 19:06:24'),
(126, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 19:22:52'),
(127, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-05-02 19:23:33'),
(128, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-02 19:30:56'),
(129, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 19:34:25'),
(130, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 19:35:22'),
(131, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 19:47:10'),
(132, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 19:56:57'),
(133, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 20:01:04'),
(134, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 20:06:18'),
(135, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 20:18:47'),
(136, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-02 20:19:35'),
(137, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 20:32:38'),
(138, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 20:39:11'),
(139, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 20:59:35'),
(140, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 21:07:13'),
(141, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 21:19:09'),
(142, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 21:31:23'),
(143, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 21:50:01'),
(144, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 22:09:12'),
(145, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-02 22:09:24'),
(146, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-02 22:10:18'),
(147, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-03 01:24:29'),
(148, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-04 19:03:56'),
(149, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-04 19:05:52'),
(150, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-04 19:06:49'),
(151, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-04 19:25:48'),
(152, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-04 19:27:24'),
(153, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-04 19:28:26'),
(154, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-04 19:30:40'),
(155, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-04 19:33:24'),
(156, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-05 18:29:52'),
(157, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-05 18:35:50'),
(158, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-12 20:41:08'),
(159, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-12 20:50:42'),
(160, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-15 20:04:23'),
(161, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-15 20:06:30'),
(162, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-16 10:13:50'),
(163, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-16 10:18:44'),
(164, 'andres@aprendiz.sena.edu.co', '127.0.0.1', 1, '2026-05-16 10:22:38'),
(165, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-18 20:14:14'),
(166, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-18 20:58:50'),
(167, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-18 21:42:03'),
(168, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-18 21:42:35'),
(169, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-18 21:47:06'),
(170, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-05-18 22:07:00'),
(171, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-05-18 22:10:33'),
(172, 'andres@aprendiz.sena.edu.co', '127.0.0.1', 1, '2026-05-18 22:10:45'),
(173, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-18 22:11:19'),
(174, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-18 22:11:33'),
(175, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-18 22:11:58'),
(176, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-18 22:37:36'),
(177, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-18 22:43:18'),
(178, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-18 22:45:37'),
(179, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-18 22:55:33'),
(180, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-18 22:55:55'),
(181, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-18 23:19:38'),
(182, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-18 23:30:17'),
(183, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-19 00:09:01'),
(184, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-19 20:39:29'),
(185, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-25 18:43:51'),
(186, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-25 18:46:16'),
(187, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-25 19:43:27'),
(188, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-25 19:44:22'),
(189, 'andres@aprendiz.sena.edu.co', '127.0.0.1', 1, '2026-05-25 19:55:08'),
(190, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-25 19:55:59'),
(191, 'cc@gmail.com', '127.0.0.1', 1, '2026-05-25 19:57:03'),
(192, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-26 19:51:21'),
(193, 'sg2@gmail.com', '127.0.0.1', 1, '2026-05-26 20:25:35'),
(194, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-26 20:25:52'),
(195, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-26 20:38:42'),
(196, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-27 18:24:01'),
(197, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-27 18:34:44'),
(198, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-27 18:35:57'),
(199, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-27 18:55:42'),
(200, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-27 19:30:24'),
(201, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-27 20:18:06'),
(202, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-27 20:18:40'),
(203, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-27 20:42:10'),
(204, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-27 20:43:09'),
(205, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-27 20:52:16'),
(206, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-27 20:52:39'),
(207, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-27 20:58:22'),
(208, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-27 21:04:56'),
(209, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-28 18:25:58'),
(210, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-28 18:29:54'),
(211, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-28 19:05:41'),
(212, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-28 19:32:20'),
(213, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-28 20:26:57'),
(214, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-05-28 20:39:43'),
(215, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-05-28 20:45:24'),
(216, 'andres@aprendiz.sena.edu.co', '127.0.0.1', 1, '2026-05-28 20:53:49'),
(217, 'cc@gmail.com', '127.0.0.1', 1, '2026-05-28 20:58:47'),
(218, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-29 18:09:21'),
(219, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-29 18:09:52'),
(220, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-29 18:15:16'),
(221, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-29 18:15:26'),
(222, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-29 18:49:43'),
(223, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-29 18:56:52'),
(224, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-05-29 19:02:49'),
(225, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-05-29 20:34:23'),
(226, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-01 18:12:12'),
(227, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-01 18:12:24'),
(228, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-01 18:29:18'),
(229, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-02 18:26:48'),
(230, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-02 18:28:53'),
(231, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-02 18:29:30'),
(232, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-02 18:32:18'),
(233, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-02 19:20:48'),
(234, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-02 20:56:24'),
(235, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-02 20:56:46'),
(236, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-07 14:48:23'),
(237, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-07 14:50:23'),
(238, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-06-07 14:50:40'),
(239, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-06-07 14:50:58'),
(240, 'andres@aprendiz.sena.edu.co', '127.0.0.1', 1, '2026-06-07 14:51:23'),
(241, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-07 16:26:24'),
(242, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-07 16:26:36'),
(243, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-07 16:26:55'),
(244, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-07 16:27:31'),
(245, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-07 16:58:36'),
(246, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-07 17:00:41'),
(247, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-07 17:50:07'),
(248, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-07 17:52:57'),
(249, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-07 17:53:51'),
(250, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-07 17:55:41'),
(251, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-07 18:28:25'),
(252, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-08 11:11:51'),
(253, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 11:12:30'),
(254, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-06-08 11:14:03'),
(255, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-08 14:02:26'),
(256, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 14:02:48'),
(257, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 14:12:25'),
(258, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-08 14:13:18'),
(259, 'andres@aprendiz.sena.edu.co', '127.0.0.1', 1, '2026-06-08 14:18:45'),
(260, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 14:33:59'),
(261, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 14:51:19'),
(262, 'andres@aprendiz.sena.edu.co', '127.0.0.1', 1, '2026-06-08 15:02:20'),
(263, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 19:16:16'),
(264, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 19:32:35'),
(265, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 19:59:37'),
(266, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 20:09:46'),
(267, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-06-08 20:19:21'),
(268, 'documentosorozco25@gmail.com', '127.0.0.1', 0, '2026-06-08 20:22:14'),
(269, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-08 20:23:51'),
(270, 'documentosorozco25@gmail.com', '127.0.0.1', 0, '2026-06-08 20:24:44'),
(271, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-08 21:05:31'),
(272, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 21:10:32'),
(273, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 21:14:48'),
(274, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 21:22:04'),
(275, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 21:25:01'),
(276, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 21:29:06'),
(277, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-08 21:33:43'),
(278, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-06-08 21:42:16'),
(279, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-08 21:44:12'),
(280, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-08 21:50:43'),
(281, 'andres@aprendiz.sena.edu.co', '127.0.0.1', 1, '2026-06-08 21:52:37'),
(282, 'cc@gmail.com', '127.0.0.1', 1, '2026-06-08 21:53:08'),
(283, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-10 12:48:01'),
(284, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-10 13:00:04'),
(285, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-10 13:01:02'),
(286, 'sbecerra@sena.edu.co', '127.0.0.1', 1, '2026-06-10 13:10:06'),
(287, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-10 13:46:10'),
(288, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-10 14:13:50'),
(289, 'mgomez@sena.edu.co', '127.0.0.1', 1, '2026-06-10 14:41:42'),
(290, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-10 14:41:51'),
(291, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-10 17:05:43'),
(292, 'documentosorozco25@gmail.com', '127.0.0.1', 1, '2026-06-10 17:05:59'),
(293, 'andresfelipeorozcopiedrahita@gmail.com', '127.0.0.1', 1, '2026-06-10 17:43:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jornadas_ficha`
--

CREATE TABLE `jornadas_ficha` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ficha_id` bigint(20) UNSIGNED NOT NULL,
  `tipo` enum('mañana','tarde','noche','fin_de_semana') NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `jornadas_ficha`
--

INSERT INTO `jornadas_ficha` (`id`, `ficha_id`, `tipo`, `activo`, `creado_en`) VALUES
(11, 2, 'noche', 1, '2026-04-27 19:17:17'),
(12, 1, 'noche', 1, '2026-04-27 19:21:58'),
(14, 3, 'tarde', 1, '2026-05-15 20:06:04'),
(15, 4, 'noche', 1, '2026-06-08 20:05:32'),
(16, 5, 'noche', 1, '2026-06-08 20:13:59'),
(17, 6, 'noche', 1, '2026-06-08 21:37:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `macrorregiones`
--

CREATE TABLE `macrorregiones` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `macrorregiones`
--

INSERT INTO `macrorregiones` (`id`, `nombre`, `creado_en`, `actualizado_en`) VALUES
(1, 'Centro', '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(2, 'Norte', '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(3, 'Occidental', '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(4, 'Oriental', '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(5, 'Suroriental', '2026-05-18 23:32:35', '2026-05-18 23:32:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_04_12_100001_create_centros_formacion_table', 1),
(2, '2026_04_12_100002_create_programas_formacion_table', 1),
(3, '2026_04_12_100003_create_usuarios_table', 1),
(4, '2026_04_12_100004_create_fichas_caracterizacion_table', 1),
(5, '2026_04_12_100005_alter_usuarios_add_ficha_fk', 1),
(6, '2026_04_12_100006_create_jornadas_ficha_table', 1),
(7, '2026_04_12_100007_create_horarios_table', 1),
(8, '2026_04_12_100008_create_ficha_instructor_table', 1),
(9, '2026_04_12_100009_create_sesiones_table', 1),
(10, '2026_04_12_100010_create_registros_asistencia_table', 1),
(11, '2026_04_12_100011_create_registros_asistencia_backup_table', 1),
(12, '2026_04_12_100012_create_dias_festivos_table', 1),
(13, '2026_04_12_100013_create_intentos_login_table', 1),
(14, '2026_04_12_100014_create_tokens_reset_table', 1),
(15, '2026_04_12_100015_create_importaciones_aprendices_table', 1),
(16, '2026_04_12_100016_create_historial_actividad_table', 1),
(17, '2026_04_12_100017_create_configuracion_table', 1),
(18, '2026_04_12_133916_create_personal_access_tokens_table', 1),
(19, '2026_04_12_200001_alter_horarios_align_prd', 1),
(20, '2026_04_12_200002_alter_ficha_instructor_align_prd', 1),
(21, '2026_04_12_200003_alter_sesiones_align_prd', 1),
(22, '2026_04_12_200004_alter_registros_asistencia_align_prd', 1),
(23, '2026_04_12_200005_alter_registros_asistencia_backup_align_prd', 1),
(24, '2026_04_12_200006_alter_intentos_login_align_prd', 1),
(25, '2026_04_12_200007_alter_tokens_reset_align_prd', 1),
(26, '2026_04_12_200008_alter_importaciones_align_prd', 1),
(27, '2026_04_12_200009_alter_historial_actividad_align_prd', 1),
(28, '2026_04_12_200010_alter_configuracion_align_prd', 1),
(29, '2026_04_12_200011_create_trigger_gestor_unico', 1),
(30, '2026_05_02_000001_set_aprendiz_password_to_documento', 2),
(31, '2026_05_02_120000_add_excusa_fields_to_registros_asistencia_table', 3),
(32, '2026_05_18_000001_create_macrorregiones_table', 4),
(33, '2026_05_18_000002_create_regionales_table', 4),
(34, '2026_05_18_000003_alter_centros_formacion_add_regional_id', 4),
(35, '2026_05_18_000004_alter_programas_formacion_add_tipo', 4),
(36, '2026_05_18_000005_alter_fichas_caracterizacion_add_modalidad', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programas_formacion`
--

CREATE TABLE `programas_formacion` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `codigo` varchar(30) DEFAULT NULL,
  `tipo` enum('tecnico','tecnologo','operario','auxiliar','especializacion','complementaria') DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `programas_formacion`
--

INSERT INTO `programas_formacion` (`id`, `nombre`, `codigo`, `tipo`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, 'Análisis y Desarrollo de Software', 'ADS', 'tecnologo', 1, '2026-04-12 16:07:38', '2026-05-18 23:43:54'),
(2, 'Electricidad Industrial', 'EI', 'tecnico', 1, '2026-04-12 16:07:38', '2026-05-18 23:43:54'),
(3, 'Construcción e Infraestructura', 'CI', 'tecnico', 1, '2026-04-12 16:07:38', '2026-05-18 23:43:54'),
(7, 'Mantenimiento Mecánico Industrial', 'MMI', 'tecnologo', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(8, 'Implementación de Sistemas IoT', 'IOT', 'tecnologo', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(9, 'Control de Calidad en la Industria de Alimentos', 'CCIA', 'tecnologo', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(10, 'Prevención y Control Ambiental', 'PCA', 'tecnologo', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(11, 'Coordinación de Sistemas Integrados de Gestión', 'CSIG', 'tecnologo', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(12, 'Gestión de Sistemas Ganaderos Sostenibles', 'GSGS', 'tecnologo', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(13, 'Cocina', 'COC', 'tecnico', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(14, 'Atención Integral a la Primera Infancia', 'AIPI', 'tecnico', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(15, 'Operación de Torno y Fresadora', 'OTF', 'tecnico', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(16, 'Electricidad Industrial (CPIC)', 'EI-CPIC', 'tecnico', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(17, 'Operación de Torno y Fresadora (CPIC)', 'OTF-CPIC', 'tecnico', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(18, 'Operario en Panadería', 'OPP', 'operario', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(19, 'Auxiliar en Servicios de Bartender', 'ASB', 'auxiliar', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00'),
(20, 'Emprendimiento e Innovación', 'EMI', 'complementaria', 1, '2026-05-18 23:33:00', '2026-05-18 23:33:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regionales`
--

CREATE TABLE `regionales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `macrorregion_id` bigint(20) UNSIGNED NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `regionales`
--

INSERT INTO `regionales` (`id`, `nombre`, `macrorregion_id`, `creado_en`, `actualizado_en`) VALUES
(1, 'Boyacá', 1, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(2, 'Cundinamarca', 1, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(3, 'Distrito Capital', 1, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(4, 'Huila', 1, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(5, 'Norte de Santander', 1, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(6, 'Santander', 1, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(7, 'Tolima', 1, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(8, 'Atlántico', 2, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(9, 'Bolívar', 2, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(10, 'César', 2, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(11, 'Córdoba', 2, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(12, 'Guajira', 2, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(13, 'Magdalena', 2, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(14, 'San Andrés', 2, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(15, 'Sucre', 2, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(16, 'Antioquia', 3, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(17, 'Caldas', 3, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(18, 'Cauca', 3, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(19, 'Chocó', 3, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(20, 'Nariño', 3, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(21, 'Quindío', 3, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(22, 'Risaralda', 3, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(23, 'Valle', 3, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(24, 'Arauca', 4, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(25, 'Casanare', 4, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(26, 'Meta', 4, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(27, 'Vichada', 4, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(28, 'Amazonas', 5, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(29, 'Caquetá', 5, '2026-05-18 23:32:35', '2026-05-18 23:32:35'),
(30, 'Guainía', 5, '2026-05-18 23:32:36', '2026-05-18 23:32:36'),
(31, 'Guaviare', 5, '2026-05-18 23:32:36', '2026-05-18 23:32:36'),
(32, 'Putumayo', 5, '2026-05-18 23:32:36', '2026-05-18 23:32:36'),
(33, 'Vaupés', 5, '2026-05-18 23:32:36', '2026-05-18 23:32:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_asistencia`
--

CREATE TABLE `registros_asistencia` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sesion_id` bigint(20) UNSIGNED NOT NULL,
  `aprendiz_id` bigint(20) UNSIGNED NOT NULL,
  `tipo` enum('presente','falla','excusa','parcial') NOT NULL,
  `horas_inasistencia` tinyint(3) UNSIGNED DEFAULT NULL,
  `excusa_motivo` text DEFAULT NULL,
  `excusa_evidencia_path` varchar(512) DEFAULT NULL,
  `excusa_evidencia_nombre_original` varchar(255) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Volcado de datos para la tabla `registros_asistencia`
--

INSERT INTO `registros_asistencia` (`id`, `sesion_id`, `aprendiz_id`, `tipo`, `horas_inasistencia`, `excusa_motivo`, `excusa_evidencia_path`, `excusa_evidencia_nombre_original`, `activo`, `creado_en`, `actualizado_en`) VALUES
(29, 8, 7, 'falla', NULL, NULL, NULL, NULL, 1, '2026-04-27 19:35:13', '2026-04-27 19:36:30'),
(30, 8, 8, 'parcial', 2, NULL, NULL, NULL, 1, '2026-04-27 19:35:13', '2026-04-27 19:35:13'),
(31, 8, 13, 'falla', NULL, NULL, NULL, NULL, 1, '2026-04-27 19:35:13', '2026-04-27 19:35:13'),
(32, 8, 6, 'presente', NULL, NULL, NULL, NULL, 1, '2026-04-27 19:35:13', '2026-04-27 19:35:13'),
(33, 8, 10, 'presente', NULL, NULL, NULL, NULL, 1, '2026-04-27 19:35:13', '2026-04-27 19:35:13'),
(34, 8, 11, 'presente', NULL, NULL, NULL, NULL, 1, '2026-04-27 19:35:13', '2026-04-27 19:35:13'),
(35, 8, 14, 'presente', NULL, NULL, NULL, NULL, 1, '2026-04-27 19:35:13', '2026-04-27 19:35:13'),
(36, 8, 12, 'presente', NULL, NULL, NULL, NULL, 1, '2026-04-27 19:35:13', '2026-04-27 19:35:13'),
(37, 8, 9, 'presente', NULL, NULL, NULL, NULL, 1, '2026-04-27 19:35:13', '2026-04-27 19:35:13'),
(47, 12, 19, 'excusa', NULL, 'Cita medica', NULL, NULL, 1, '2026-05-16 10:15:47', '2026-05-16 10:15:47'),
(48, 12, 20, 'parcial', 1, NULL, NULL, NULL, 1, '2026-05-16 10:15:47', '2026-05-16 10:15:47'),
(49, 12, 25, 'falla', NULL, NULL, NULL, NULL, 1, '2026-05-16 10:15:47', '2026-05-16 10:15:47'),
(50, 12, 18, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-16 10:15:47', '2026-05-16 10:15:47'),
(51, 12, 22, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-16 10:15:47', '2026-05-16 10:15:47'),
(52, 12, 23, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-16 10:15:47', '2026-05-16 10:15:47'),
(53, 12, 26, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-16 10:15:47', '2026-05-16 10:15:47'),
(54, 12, 24, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-16 10:15:47', '2026-05-16 10:15:47'),
(55, 12, 21, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-16 10:15:47', '2026-05-16 10:15:47'),
(56, 13, 7, 'excusa', NULL, 'Porque', 'excusas/13/097ea2a0-7eee-457e-a62c-ac6d58dc6655.png', 'ChatGPT Image 12 may 2026, 08_09_56 p.m..png', 1, '2026-05-19 00:11:45', '2026-05-19 00:11:47'),
(57, 13, 8, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-19 00:11:47', '2026-05-19 00:11:47'),
(58, 13, 13, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-19 00:11:47', '2026-05-19 00:11:47'),
(59, 13, 6, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-19 00:11:47', '2026-05-19 00:11:47'),
(60, 13, 10, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-19 00:11:47', '2026-05-19 00:11:47'),
(61, 13, 11, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-19 00:11:47', '2026-05-19 00:11:47'),
(62, 13, 14, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-19 00:11:47', '2026-05-19 00:11:47'),
(63, 13, 12, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-19 00:11:47', '2026-05-19 00:11:47'),
(64, 13, 9, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-19 00:11:47', '2026-05-19 00:11:47'),
(65, 16, 19, 'excusa', NULL, 'Excusa medica', 'excusas/16/adf76f4f-63b5-4c15-b6a1-5692d4e4a432.pdf', 'allpets.pdf', 1, '2026-05-26 19:53:26', '2026-05-26 19:53:29'),
(66, 16, 20, 'parcial', 1, NULL, NULL, NULL, 1, '2026-05-26 19:53:29', '2026-05-26 19:53:29'),
(67, 16, 25, 'falla', NULL, NULL, NULL, NULL, 1, '2026-05-26 19:53:29', '2026-05-26 19:53:29'),
(68, 16, 18, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-26 19:53:29', '2026-05-26 19:53:29'),
(69, 16, 22, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-26 19:53:29', '2026-05-26 19:53:29'),
(70, 16, 23, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-26 19:53:29', '2026-05-26 19:53:29'),
(71, 16, 26, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-26 19:53:29', '2026-05-26 19:53:29'),
(72, 16, 24, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-26 19:53:29', '2026-05-26 19:53:29'),
(73, 16, 21, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-26 19:53:29', '2026-05-26 19:53:29'),
(74, 20, 7, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-28 20:48:36', '2026-05-28 20:48:36'),
(75, 20, 8, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-28 20:48:36', '2026-05-28 20:48:36'),
(76, 20, 13, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-28 20:48:36', '2026-05-28 20:48:36'),
(77, 20, 6, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-28 20:48:36', '2026-05-28 20:48:36'),
(78, 20, 10, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-28 20:48:36', '2026-05-28 20:48:36'),
(79, 20, 11, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-28 20:48:36', '2026-05-28 20:48:36'),
(80, 20, 14, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-28 20:48:36', '2026-05-28 20:48:36'),
(81, 20, 12, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-28 20:48:36', '2026-05-28 20:48:36'),
(82, 20, 9, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-28 20:48:36', '2026-05-28 20:48:36'),
(83, 21, 19, 'excusa', NULL, 'cita medica', 'excusas/21/8e95b0e9-e548-4a30-8346-06b81355b05e.pdf', 'ds089080012802126116338363.pdf', 1, '2026-05-29 18:18:32', '2026-05-29 18:18:35'),
(84, 21, 20, 'parcial', 1, NULL, NULL, NULL, 1, '2026-05-29 18:18:35', '2026-05-29 18:18:35'),
(85, 21, 25, 'falla', NULL, NULL, NULL, NULL, 1, '2026-05-29 18:18:35', '2026-05-29 18:18:35'),
(86, 21, 18, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-29 18:18:35', '2026-05-29 18:18:35'),
(87, 21, 22, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-29 18:18:35', '2026-05-29 18:18:35'),
(88, 21, 23, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-29 18:18:35', '2026-05-29 18:18:35'),
(89, 21, 26, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-29 18:18:35', '2026-05-29 18:18:35'),
(90, 21, 24, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-29 18:18:35', '2026-05-29 18:18:35'),
(91, 21, 21, 'presente', NULL, NULL, NULL, NULL, 1, '2026-05-29 18:18:35', '2026-05-29 18:18:35'),
(92, 24, 7, 'excusa', NULL, 'Calamidad', 'excusas/24/3807465e-ced1-445b-88e1-b639af8fe094.pdf', 'allusers (2).pdf', 1, '2026-06-08 21:46:47', '2026-06-08 21:46:47'),
(93, 24, 8, 'parcial', 2, NULL, NULL, NULL, 1, '2026-06-08 21:46:47', '2026-06-08 21:46:47'),
(94, 24, 13, 'falla', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:46:47', '2026-06-08 21:46:47'),
(95, 24, 6, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:46:47', '2026-06-08 21:46:47'),
(96, 24, 10, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:46:47', '2026-06-08 21:46:47'),
(97, 24, 11, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:46:47', '2026-06-08 21:46:47'),
(98, 24, 14, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:46:47', '2026-06-08 21:46:47'),
(99, 24, 12, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:46:47', '2026-06-08 21:46:47'),
(100, 24, 9, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:46:47', '2026-06-08 21:46:47'),
(101, 25, 7, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:51:56', '2026-06-08 21:51:56'),
(102, 25, 8, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:51:56', '2026-06-08 21:51:56'),
(103, 25, 13, 'falla', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:51:56', '2026-06-08 21:51:56'),
(104, 25, 6, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:51:56', '2026-06-08 21:51:56'),
(105, 25, 10, 'excusa', NULL, 'Cita medica', 'excusas/25/e16d3953-c08a-4156-b864-6c65f5b1c3ed.pdf', 'allusers (2).pdf', 1, '2026-06-08 21:51:56', '2026-06-08 21:51:56'),
(106, 25, 11, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:51:56', '2026-06-08 21:51:56'),
(107, 25, 14, 'parcial', 3, NULL, NULL, NULL, 1, '2026-06-08 21:51:56', '2026-06-08 21:51:56'),
(108, 25, 12, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:51:56', '2026-06-08 21:51:56'),
(109, 25, 9, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-08 21:51:56', '2026-06-08 21:51:56'),
(110, 27, 19, 'falla', NULL, NULL, NULL, NULL, 1, '2026-06-10 14:14:19', '2026-06-10 14:14:19'),
(111, 27, 20, 'parcial', 2, NULL, NULL, NULL, 1, '2026-06-10 14:14:19', '2026-06-10 14:14:19'),
(112, 27, 25, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-10 14:14:19', '2026-06-10 14:14:19'),
(113, 27, 18, 'parcial', 1, NULL, NULL, NULL, 1, '2026-06-10 14:14:19', '2026-06-10 14:14:19'),
(114, 27, 22, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-10 14:14:19', '2026-06-10 14:14:19'),
(115, 27, 23, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-10 14:14:19', '2026-06-10 14:14:19'),
(116, 27, 26, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-10 14:14:19', '2026-06-10 14:14:19'),
(117, 27, 24, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-10 14:14:19', '2026-06-10 14:14:19'),
(118, 27, 21, 'presente', NULL, NULL, NULL, NULL, 1, '2026-06-10 14:14:19', '2026-06-10 14:14:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_asistencia_backup`
--

CREATE TABLE `registros_asistencia_backup` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `registro_asistencia_id` bigint(20) UNSIGNED NOT NULL,
  `sesion_id` bigint(20) UNSIGNED NOT NULL,
  `aprendiz_id` bigint(20) UNSIGNED NOT NULL,
  `tipo_anterior` enum('presente','falla','excusa','parcial') DEFAULT NULL,
  `horas_inasistencia_ant` tinyint(4) DEFAULT NULL,
  `tipo_nuevo` enum('presente','falla','excusa','parcial') NOT NULL,
  `horas_inasistencia_new` tinyint(4) DEFAULT NULL,
  `modificado_por` bigint(20) UNSIGNED NOT NULL,
  `razon` varchar(255) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `registros_asistencia_backup`
--

INSERT INTO `registros_asistencia_backup` (`id`, `registro_asistencia_id`, `sesion_id`, `aprendiz_id`, `tipo_anterior`, `horas_inasistencia_ant`, `tipo_nuevo`, `horas_inasistencia_new`, `modificado_por`, `razon`, `creado_en`) VALUES
(1, 2, 3, 7, 'excusa', NULL, 'parcial', 1, 4, 'Correccion acordada', '2026-04-12 22:25:03'),
(2, 21, 5, 20, 'parcial', 4, 'parcial', 15, 3, NULL, '2026-04-14 19:47:05'),
(3, 21, 5, 20, 'parcial', 15, 'parcial', 4, 3, NULL, '2026-04-14 19:47:16'),
(4, 29, 8, 7, 'excusa', NULL, 'falla', NULL, 3, NULL, '2026-04-27 19:36:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones`
--

CREATE TABLE `sesiones` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ficha_id` bigint(20) UNSIGNED NOT NULL,
  `horario_id` bigint(20) UNSIGNED NOT NULL,
  `instructor_id` bigint(20) UNSIGNED NOT NULL,
  `horas_programadas` tinyint(3) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('abierta','cerrada') NOT NULL DEFAULT 'abierta',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sesiones`
--

INSERT INTO `sesiones` (`id`, `ficha_id`, `horario_id`, `instructor_id`, `horas_programadas`, `fecha`, `estado`, `creado_en`, `actualizado_en`) VALUES
(8, 2, 21, 3, 4, '2026-04-27', 'cerrada', '2026-04-27 19:31:41', '2026-04-27 19:35:13'),
(10, 2, 21, 3, 4, '2026-05-04', 'abierta', '2026-05-04 19:06:10', '2026-05-04 19:06:10'),
(11, 3, 31, 3, 4, '2026-05-15', 'abierta', '2026-05-15 20:06:49', '2026-05-15 20:06:49'),
(12, 3, 30, 3, 4, '2026-05-16', 'cerrada', '2026-05-16 10:14:14', '2026-05-16 10:15:47'),
(13, 2, 21, 3, 4, '2026-05-18', 'cerrada', '2026-05-19 00:10:11', '2026-05-19 00:11:47'),
(14, 2, 21, 3, 4, '2026-05-25', 'abierta', '2026-05-25 18:44:15', '2026-05-25 18:44:15'),
(15, 3, 29, 3, 16, '2026-05-19', 'abierta', '2026-05-25 18:44:35', '2026-05-25 18:44:35'),
(16, 3, 29, 3, 16, '2026-05-26', 'cerrada', '2026-05-26 19:52:33', '2026-05-26 19:53:29'),
(17, 1, 24, 3, 4, '2026-05-26', 'abierta', '2026-05-26 20:26:12', '2026-05-26 20:26:12'),
(18, 1, 24, 3, 4, '2026-05-19', 'abierta', '2026-05-27 20:43:25', '2026-05-27 20:43:25'),
(19, 3, 32, 4, 4, '2026-05-28', 'abierta', '2026-05-28 20:47:46', '2026-05-28 20:47:46'),
(20, 2, 22, 4, 4, '2026-05-19', 'cerrada', '2026-05-28 20:48:28', '2026-05-28 20:48:36'),
(21, 3, 31, 3, 4, '2026-05-29', 'cerrada', '2026-05-29 18:16:14', '2026-05-29 18:18:35'),
(22, 2, 21, 3, 4, '2026-06-01', 'abierta', '2026-06-01 18:13:21', '2026-06-01 18:13:21'),
(23, 3, 30, 3, 4, '2026-05-30', 'abierta', '2026-06-01 18:15:12', '2026-06-01 18:15:12'),
(24, 2, 21, 3, 4, '2026-05-11', 'cerrada', '2026-06-08 21:45:29', '2026-06-08 21:46:47'),
(25, 2, 21, 3, 4, '2026-06-08', 'cerrada', '2026-06-08 21:51:21', '2026-06-08 21:51:56'),
(26, 3, 29, 3, 16, '2026-06-09', 'abierta', '2026-06-10 13:01:30', '2026-06-10 13:01:30'),
(27, 3, 30, 3, 4, '2026-06-06', 'cerrada', '2026-06-10 14:14:03', '2026-06-10 14:14:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tokens_reset`
--

CREATE TABLE `tokens_reset` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(255) NOT NULL,
  `usado` tinyint(4) NOT NULL DEFAULT 0,
  `expira_en` datetime NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tokens_reset`
--

INSERT INTO `tokens_reset` (`id`, `usuario_id`, `token`, `usado`, `expira_en`, `creado_en`) VALUES
(1, 3, '564614799ab9b60accb2f3d04648f527ac092b5bfee584b694e2aa554af962b9', 1, '2026-04-12 17:10:56', '2026-04-12 16:10:56'),
(2, 3, 'c62193f85d6ccb5b2af099006b708bd511670c356d767f794d4ac29b6c5f22aa', 1, '2026-04-12 17:16:36', '2026-04-12 16:16:36'),
(3, 3, 'cfc8a92765fe0e0e0af2f28b569d2746d1add58a4688eb4f98a09f25f1edff46', 1, '2026-04-12 17:41:28', '2026-04-12 16:41:28'),
(4, 1, '2dfe451a7066aa7eddcc36faf7bedefe2a57514a3474666aada951415fcbd410', 1, '2026-04-14 23:51:16', '2026-04-14 22:51:16'),
(5, 1, 'd71e7776a3dec732b2dbd64f25098627856e5710f61ace3faf905681e5f639a3', 1, '2026-04-14 23:52:57', '2026-04-14 22:52:57'),
(6, 1, '63a0e6fbd613cd8e5e0329d05f9bf1d59667b93b27f3e839a6c8c46d9a593744', 1, '2026-04-15 00:00:06', '2026-04-14 23:00:06'),
(7, 1, '07c31d2d7f75453611d9efbe89d731605e5e902ae9a69ec0ff70a2fdf35279bb', 0, '2026-04-15 00:05:04', '2026-04-14 23:05:04'),
(8, 3, 'ac877389cd7598c71c2cd387e572edf81f129752e2def6f2f8abfc914e1d409b', 1, '2026-05-02 09:13:20', '2026-05-02 08:13:20'),
(9, 5, '3907b8ead13e4f26a6dbfc4caf249e10d3ec3a8b5de369d1c64cfc7d7a01074a', 0, '2026-05-02 12:54:10', '2026-05-02 11:54:10'),
(10, 3, '50d33d5f48a74a7197178807cf72230a0efaf621db89077b013e232405bae6fc', 1, '2026-06-07 18:58:05', '2026-06-07 17:58:05'),
(11, 3, '75d095daecbb948c75cc928f71adc4363e2101bdfce10f14bb88c76c2cee30b2', 1, '2026-06-07 19:19:41', '2026-06-07 18:19:41'),
(12, 3, 'c29da17e9f34ede5a89e8857ebdc274d7a365de297e1d5b8b195394841ceb384', 1, '2026-06-07 19:28:51', '2026-06-07 18:28:51'),
(13, 3, 'fab0671f11eb1ec7b7db01fcb28aadb532a9094bee1dd0caae683f953f9936e8', 1, '2026-06-07 19:34:42', '2026-06-07 18:34:42'),
(14, 3, '9794baf8eeac2897bf5c935e62ef69e810afa0b67e4ae9920033dd05753ca347', 1, '2026-06-08 15:53:48', '2026-06-08 14:53:48'),
(15, 3, '88045903f0c9b1785c80155b4d405c7e3d267e3764747f2844cb1b8f9ba6f405', 1, '2026-06-08 19:39:38', '2026-06-08 18:39:38'),
(16, 3, '2484d10677ffbe21971ff88153fd0ce6129038057012af57bd995841754d7bd7', 1, '2026-06-08 19:44:25', '2026-06-08 18:44:25'),
(17, 3, '8fc02a9d03fb53370bfeab9f5a08f380e54129415ef858e6453343f4a0d6113b', 1, '2026-06-08 19:48:11', '2026-06-08 18:48:11'),
(18, 3, 'dbb740c0b775fe8968d903da8962f694bfdcfbb2e380cfbbd113c2b5cc1d5bc2', 1, '2026-06-08 20:14:15', '2026-06-08 19:14:15'),
(19, 3, '3797d8bdfc55d2a1e39ca8654c2683f86ed48ef1ed830b17c5cb92c83ab4a259', 1, '2026-06-08 20:15:32', '2026-06-08 19:15:32'),
(20, 3, 'a0ed1eb214b07de28fd07955040e1ffa3a42d5872bf5579e947f4a50f0e513d5', 1, '2026-06-08 20:30:07', '2026-06-08 19:30:07'),
(21, 3, 'af381ea9d3306a3433f931ee1becff0427adc037a36006b633e79f68d915c0ff', 1, '2026-06-08 20:58:54', '2026-06-08 19:58:54'),
(22, 3, '251d3cfb5279afed3e4982ad343288589af6fb481111a34364e2a0c94b87b419', 1, '2026-06-08 21:09:10', '2026-06-08 20:09:10'),
(23, 3, '362005718f8be18210a3c502ca5e956160448c328575e4ebcf4aa11f280618b9', 1, '2026-06-08 22:09:53', '2026-06-08 21:09:53'),
(24, 3, '0ebe2f2b111ac0363e73774de10bb209eaf62310b6e4495f81914a1fec21905d', 1, '2026-06-08 22:14:05', '2026-06-08 21:14:05'),
(25, 3, '0ce9d39a0c2e64a059579e37dd317be8ad6e32f0980015511b1c5da550e275ed', 1, '2026-06-08 22:19:56', '2026-06-08 21:19:56'),
(26, 3, 'ae8627ef22bf96a0edc25732a835825e201052251356aa4e72135073cfe3bfb6', 1, '2026-06-08 22:21:27', '2026-06-08 21:21:27'),
(27, 3, '117edc2dd2f5d75b29c42099b340c26b1feb517afad84f4d54e635f46daf5135', 1, '2026-06-08 22:24:26', '2026-06-08 21:24:26'),
(28, 3, '49c20291f44292cda5941d94ba59df262983dd70cde8ad7b69b60f37c041ece3', 1, '2026-06-08 22:28:29', '2026-06-08 21:28:29'),
(29, 3, 'e74e4ed76a9db2927154a369b7901c0425465e8dca56be51d283566e6e271fb4', 0, '2026-06-08 22:33:01', '2026-06-08 21:33:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `documento` varchar(20) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `rol` enum('admin','coordinador','instructor','gestor_grupo','aprendiz') NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `ficha_id` bigint(20) UNSIGNED DEFAULT NULL,
  `totp_secret` varchar(100) DEFAULT NULL,
  `totp_verificado` tinyint(4) NOT NULL DEFAULT 0,
  `avatar_color` varchar(7) NOT NULL DEFAULT '#3DAE2B',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `documento`, `correo`, `password`, `rol`, `activo`, `ficha_id`, `totp_secret`, `totp_verificado`, `avatar_color`, `creado_en`, `actualizado_en`) VALUES
(1, 'José Germán', 'Estrada Clavijo', '12345678', 'andresfelipeorozcopiedrahita@gmail.com', '$2y$12$H3yU2gkGMpOU/JnrVeF1YeEPtpjrHjUGumgMmsbpuYlKNL/l2kN.a', 'admin', 1, NULL, 'S6WPDIJLKWLCTCQOOMW5LMDKMMS7Q3F7', 1, '#7B1FA2', '2026-04-12 16:07:39', '2026-04-12 17:34:04'),
(2, 'Santiago', 'Becerra Henao', '87654321', 'sbecerra@sena.edu.co', '$2y$12$B7n/WbKw3eu8aMY0p2ME0e7W/aGFMRFaxp1eLUmVnn77NRxXXzJ0K', 'coordinador', 1, NULL, 'UFXV24WZ7RGHLO7CLLHGJXALHUGXG6I4', 1, '#1565C0', '2026-04-12 16:07:39', '2026-04-12 17:36:07'),
(3, 'Carlos', 'López Martínez', '11111111', 'documentosorozco25@gmail.com', '$2y$10$rlT8PAo.yo6cip4aieNLNOA2kU0agbDvA2XwSQhuB.eirzxbrzO9m', 'instructor', 1, NULL, 'L4C6MH4WUMWIJEHMGBGFD53AGJCYRFA3', 1, '#2E7D22', '2026-04-12 16:07:39', '2026-06-08 20:26:02'),
(4, 'María', 'Gómez Torres', '22222222', 'mgomez@sena.edu.co', '$2y$12$DUFi1r1m3LfNS5YhqSJCmu3ZtJ9sDTvro/XzZx4c6/hXdXzYwDIWS', 'gestor_grupo', 1, NULL, '7RK2D75QKKS2O2Q5VX6E6OPEKJ6BSEUS', 1, '#3DAE2B', '2026-04-12 16:07:39', '2026-04-12 17:37:44'),
(5, 'Andrés Felipe', 'Orozco Piedrahita', '33333333', 'andres@aprendiz.sena.edu.co', '$2y$12$FCOvTZeeGB.q2Xrq4NXU8eS2BoQWiYZkK3u2pQKIHwqfU9JbFsOVC', 'aprendiz', 1, NULL, NULL, 0, '#616161', '2026-04-12 16:07:39', '2026-05-02 11:49:02'),
(6, 'Denis', 'gutierrez', '44445444', 'dg@gmail.com', '$2y$12$rccX3ko1yLz.f3dLJqVVXuVMrOSI0piyhBfjFsXWnzby0LVWj0ip2', 'aprendiz', 1, 2, NULL, 0, '#3DAE2B', '2026-04-12 18:59:26', '2026-05-02 11:49:02'),
(7, 'Santiago', 'Arboleda', '3332333', 'sg@gmail.com', '$2y$12$.bUKpEU68g0qex.zMe47e.UZonLSebBttV9XZJSU3qF7381KyY8ry', 'aprendiz', 1, 2, NULL, 0, '#3DAE2B', '2026-04-12 18:59:26', '2026-05-02 11:49:02'),
(8, 'Cindi', 'Castro', '7177777', 'cc@gmail.com', '$2y$12$YYkVJfDXcKnqlvZ4wNA3BucGxQ4iWtnIL.1rMUxzOxwiz3G9pwPZa', 'aprendiz', 1, 2, NULL, 0, '#3DAE2B', '2026-04-12 18:59:26', '2026-05-02 11:49:02'),
(9, 'Michael', 'Villegas', '9989999', 'mv@gmail.com', '$2y$12$yvU4A4elyab3EqpeOkwYTeFRrhKnhbRdB3Plwl8pz5NKhbPDr3HZG', 'aprendiz', 1, 2, NULL, 0, '#3DAE2B', '2026-04-12 18:59:26', '2026-05-02 11:49:02'),
(10, 'Felipe', 'Osorio', '1111311', 'fo@gmail.com', '$2y$12$ZoJw/GIoTCy0GJjWSSyLqOm0T7Jr8fihFHR.ddSjUpojkl2wp9VZm', 'aprendiz', 1, 2, NULL, 0, '#3DAE2B', '2026-04-12 18:59:26', '2026-05-02 11:49:03'),
(11, 'Carlos', 'Quinchia', '2292222', 'cq@gmail.com', '$2y$12$3H5jOv79xn6HaQnJCKcOIOU29zeUj.BjYUYEhn.Pd5jW43Csty50.', 'aprendiz', 1, 2, NULL, 0, '#3DAE2B', '2026-04-12 18:59:26', '2026-05-02 11:49:03'),
(12, 'Mario', 'Uribe', '8888788', 'mu@gmail.com', '$2y$12$qrNuqnerjoyDURJA15N5A.wtBE4eSk/DNqp6Zk53PbIcXDZMbf.kW', 'aprendiz', 1, 2, NULL, 0, '#3DAE2B', '2026-04-12 18:59:26', '2026-05-02 11:49:03'),
(13, 'Adrian', 'Cepeda', '5552555', 'ac@gmail.com', '$2y$12$YygIxRHJd31xkXzuJNBKheWdumOm21pquaCcQRztBliGt./92aMnm', 'aprendiz', 1, 2, NULL, 0, '#3DAE2B', '2026-04-12 18:59:26', '2026-05-02 11:49:03'),
(14, 'Vannesa', 'Ricaurte', '6666166', 'vr@gmail.com', '$2y$12$CMTZ9gGHUDS9AeN2lRzIyOYDMiRhX6wsvYgIfaJrGpmgYtB4J.Eu6', 'aprendiz', 1, 2, NULL, 0, '#3DAE2B', '2026-04-12 18:59:26', '2026-05-02 11:49:03'),
(15, 'Guillermo Antonio', 'Escamilla Osorio', '2458796', 'guilleesca@gmail.com', '$2y$12$F5hHz3pIl2w.q.p6OXrCB.qgzjW7j.enPqsyXjJ4tBHhDJYaMjIBO', 'instructor', 1, NULL, 'OOEKLAH6XPL44DIZV2RFGVXZTB2X6WVI', 0, '#3DAE2B', '2026-04-12 19:58:01', '2026-04-12 20:01:24'),
(16, 'Tobias Angel', 'Villada Lopez', '75698456', 'tobias23@gmail.com', '$2y$12$x1EhKBlg7uLCNsat7649v.k7aSes.spP62n7v9TXFEL2BZg1ygyLu', 'aprendiz', 1, 1, NULL, 0, '#3DAE2B', '2026-04-12 19:59:54', '2026-05-02 11:49:04'),
(18, 'Denis', 'gutierrez', '144445444', 'dg1@gmail.com', '$2y$12$fwWCK6pceOvFHYI0O7XNx.ZDbNe9VyVrYgUfopJTf.wZ1WH8gO7DS', 'aprendiz', 1, 3, NULL, 0, '#3DAE2B', '2026-04-14 19:29:48', '2026-05-02 11:49:04'),
(19, 'Santiago', 'Arboleda', '23332333', 'sg2@gmail.com', '$2y$12$JDmZdNcihR13qa8hGGHDK.3d20d6cqmmI/QNyyS/7.DrLCCiSmJHK', 'aprendiz', 1, 3, NULL, 0, '#3DAE2B', '2026-04-14 19:29:48', '2026-05-02 11:49:04'),
(20, 'Cindi', 'Castro', '37177777', 'cc3@gmail.com', '$2y$12$tRyHph2qhBk78GpWjjRvdO.c3cQQXW.GdNDH0k96QX.CB0GHGltxm', 'aprendiz', 1, 3, NULL, 0, '#3DAE2B', '2026-04-14 19:29:48', '2026-05-02 11:49:04'),
(21, 'Michael', 'Villegas', '49989999', 'mv4@gmail.com', '$2y$12$SQy4Io2m5pO5e4MZOyJ35uxosZanSOpwOkXnwT1g6Z82a17freS7S', 'aprendiz', 1, 3, NULL, 0, '#3DAE2B', '2026-04-14 19:29:48', '2026-05-02 11:49:05'),
(22, 'Felipe', 'Osorio', '51111311', 'fo5@gmail.com', '$2y$12$yBHHVfRPDCzy8pDDbVnshua8I86ls1E8eaWqpwgqUhXUJMbmVZ2qm', 'aprendiz', 1, 3, NULL, 0, '#3DAE2B', '2026-04-14 19:29:48', '2026-05-02 11:49:05'),
(23, 'Carlos', 'Quinchia', '62292222', 'cq6@gmail.com', '$2y$12$rJJWWn2rCSkC.1rdaD5Vb./MXUJl3qL6R5rVrzlwuWjM7IzWXBSFq', 'aprendiz', 1, 3, NULL, 0, '#3DAE2B', '2026-04-14 19:29:48', '2026-05-02 11:49:05'),
(24, 'Mario', 'Uribe', '78888788', 'mu7@gmail.com', '$2y$12$8IgBilm7ldx7/G9ZXrL3wu8zlNXKaYExSNqmwH/w8Ca70GK35H3Mi', 'aprendiz', 1, 3, NULL, 0, '#3DAE2B', '2026-04-14 19:29:48', '2026-05-02 11:49:05'),
(25, 'Adrian', 'Cepeda', '85552555', 'ac8@gmail.com', '$2y$12$FluUoKWAEe53GUUChX5f3OyLpUC6gUjcR0YJvT6A6EBh2.ZId3ocO', 'aprendiz', 1, 3, NULL, 0, '#3DAE2B', '2026-04-14 19:29:48', '2026-05-02 11:49:05'),
(26, 'Vannesa', 'Ricaurte', '96666166', 'vr9@gmail.com', '$2y$12$nikpP4W15cZszRef7qRvbOwu8OmbhhacRt00b.kuJ9ghtlHPUJgKa', 'aprendiz', 1, 3, NULL, 0, '#3DAE2B', '2026-04-14 19:29:48', '2026-05-02 11:49:06'),
(27, 'Carlos', 'Marin', '459656256', 'cmarin@sena.edu.co', '$2y$10$C5GdKGvNr92IJe4D3GOpEu4pQfioWs4kuGv/pAolOC/uwJLqe36De', 'instructor', 1, NULL, '53UZE2QXN56X6IEZI4QA4UQX6KCNB7S2', 0, '#3DAE2B', '2026-06-08 20:01:51', '2026-06-08 20:01:51'),
(28, 'Gustavo', 'Angarita', '214595632', 'gangarita@sena.edu.co', '$2y$10$y0wNKnYetPJxWF2y4f8XU.YjOKQ2kiQwoIT9k2usKITPh1ZsxHgPS', 'instructor', 1, NULL, 'ZBDGMJYUGBMVMUROKRZ7CWOKUB7OBFDG', 0, '#3DAE2B', '2026-06-08 20:11:07', '2026-06-08 20:11:07'),
(29, 'Carlos', 'Gutierrez', '2144445444', 'dg13@gmail.com', '$2y$10$9g1RReLI5ihUVv7i3PcALOGqJGIdLyfjRpokDpt/KPDaifBzG5NlG', 'aprendiz', 1, 5, NULL, 0, '#3DAE2B', '2026-06-08 20:14:40', '2026-06-08 20:14:40'),
(30, 'Mateo', 'Velasquez', '323332333', 'sg24@gmail.com', '$2y$10$gjpiGQqyJIb19GA3NwNno.YL2dofnZJCSCtWIcDpO08BsUJlfjkbW', 'aprendiz', 1, 5, NULL, 0, '#3DAE2B', '2026-06-08 20:14:40', '2026-06-08 20:14:40'),
(31, 'Laura', 'Henao', '437177777', 'cc35@gmail.com', '$2y$10$rpVLUu7gH96qoadjO3L7zO81y92brf/QX0g2YClaPN0Xi42sHAplm', 'aprendiz', 1, 5, NULL, 0, '#3DAE2B', '2026-06-08 20:14:40', '2026-06-08 20:14:40'),
(32, 'Carmen', 'Villa', '549989999', 'mv47@gmail.com', '$2y$10$ZLXJ/tntOD1JyMd.tFwzWeefgWdP1fys21RjIaxeM95x6nTa1M0bW', 'aprendiz', 1, 5, NULL, 0, '#3DAE2B', '2026-06-08 20:14:40', '2026-06-08 20:14:40'),
(33, 'Raul', 'Orozco', '651111311', 'fo58@gmail.com', '$2y$10$TyuCK4PHyAya/9.Ahw73feLysUkzEnyQBoA.rlbXAg2ZvUJEwyNj2', 'aprendiz', 1, 5, NULL, 0, '#3DAE2B', '2026-06-08 20:14:40', '2026-06-08 20:14:40'),
(34, 'Tomas', 'Velez', '762292222', 'cq69@gmail.com', '$2y$10$oD2pE5i.hqCH7zKynNC3r.PHYV2lSZk0BdDVCA9794zQb9vW7a7Ni', 'aprendiz', 1, 5, NULL, 0, '#3DAE2B', '2026-06-08 20:14:40', '2026-06-08 20:14:40'),
(35, 'Luis', 'Lopez', '878888788', 'mu70@gmail.com', '$2y$10$wcmL6LkSQ1jBXY0RWCEUrulzCgUD6XcMia6Q/3aDRWLCx8FzhyslO', 'aprendiz', 1, 5, NULL, 0, '#3DAE2B', '2026-06-08 20:14:40', '2026-06-08 20:14:40'),
(36, 'Viviana', 'Garcia', '985552555', 'ac86@gmail.com', '$2y$10$4c76TJ/GHnCDtCcQJ3oPQ.iUr/KKhmM3LVJs5AgB99xuNIyBL8jS2', 'aprendiz', 1, 5, NULL, 0, '#3DAE2B', '2026-06-08 20:14:41', '2026-06-08 20:14:41'),
(37, 'Alejandra', 'Rodas', '1196666166', 'vr98@gmail.com', '$2y$10$34GeCbTny5f5OKHPDb9A/OqDIBI85kMeqyBE1Oc84Q2SwiIm9Ngsi', 'aprendiz', 1, 5, NULL, 0, '#3DAE2B', '2026-06-08 20:14:41', '2026-06-08 20:14:41'),
(38, 'Jorge', 'Perez', '45789632', 'gperez@sena.edu.co', '$2y$10$Pepf5DjBRdOiB7lKaoYcsuRFtimm4f5PoiZmVztxt08K8CUL7/xLu', 'instructor', 1, NULL, '54SOITC4PRUTVTTXMPHOSLFKICLAAULO', 0, '#3DAE2B', '2026-06-08 21:30:42', '2026-06-08 21:32:21'),
(39, 'Mauricio', 'Villa', '21456698', 'mvilla@sena.edu.co', '$2y$10$XZEAct/.IdnpthHm2fcl0Otd2DytQiwbw2ZtE67JfqxzKXVu.VcgS', 'instructor', 1, NULL, 'CO77R7FFYXESJJCTKV3K3APK6KNOEKAC', 0, '#3DAE2B', '2026-06-08 21:35:19', '2026-06-08 21:35:19'),
(40, 'Carlos', 'Gutierrez', '2144445', 'dg134@gmail.com', '$2y$10$yf3iEG7wx1G1kN/bJK1Cd.VytHRf2OgrpNKA2IlXIgl4STShAjG2q', 'aprendiz', 1, 6, NULL, 0, '#3DAE2B', '2026-06-08 21:38:42', '2026-06-08 21:38:42'),
(41, 'Mateo', 'Velasquez', '3233323', 'sg245@gmail.com', '$2y$10$0iphk/IAlbct2z12NsOt0ugp2XhE75plykInVRjOeVI3dXaEQ3Sai', 'aprendiz', 1, 6, NULL, 0, '#3DAE2B', '2026-06-08 21:38:42', '2026-06-08 21:38:42'),
(42, 'Laura', 'Henao', '4371777', 'cc355@gmail.com', '$2y$10$RuB/Gprus6aSYmleF5BPIe2Jucuhn5P66KduG7tNxlZXxheuo.OCG', 'aprendiz', 1, 6, NULL, 0, '#3DAE2B', '2026-06-08 21:38:42', '2026-06-08 21:38:42'),
(43, 'Carmen', 'Villa', '5499999', 'mv475@gmail.com', '$2y$10$wZvIROKUL7PI55UE88cDVuK4mHtl8xKT0fhowxGEACKAvK6JolRyS', 'aprendiz', 1, 6, NULL, 0, '#3DAE2B', '2026-06-08 21:38:43', '2026-06-08 21:38:43'),
(44, 'Raul', 'Orozco', '6511311', 'fo584@gmail.com', '$2y$10$orh8aCmmG88nd829h9omT.1X/HkASOGW2uc.L0mdZLVPglqh1Ky86', 'aprendiz', 1, 6, NULL, 0, '#3DAE2B', '2026-06-08 21:38:43', '2026-06-08 21:38:43'),
(45, 'Tomas', 'Velez', '76222222', 'cq692@gmail.com', '$2y$10$FI574y8EFrQEjUIPobPNG.gmU3GlyVfxROpnXPKZ1RZcONRZteK3e', 'aprendiz', 1, 6, NULL, 0, '#3DAE2B', '2026-06-08 21:38:43', '2026-06-08 21:38:43'),
(46, 'Luis', 'Lopez', '8788788', 'mu702@gmail.com', '$2y$10$lgC9C5mxfDwgrRKhrUrH.eBwV5iZ5C0AH6E617R9BxauKr6.UX/K6', 'aprendiz', 1, 6, NULL, 0, '#3DAE2B', '2026-06-08 21:38:43', '2026-06-08 21:38:43'),
(47, 'Viviana', 'Garcia', '9852555', 'ac861@gmail.com', '$2y$10$5yPSngEWO7RNUOeXY2/Eju8p.eHPVYHDhUjscRclNHxA8c1opKfWG', 'aprendiz', 1, 6, NULL, 0, '#3DAE2B', '2026-06-08 21:38:43', '2026-06-08 21:38:43'),
(48, 'Alejandra', 'Rodas', '119666166', 'vr988@gmail.com', '$2y$10$a25EZeQT7.mg5cJky5nw/u3yCgRMFhJuQNT3eHnrLfRUugGOQrXhK', 'aprendiz', 1, 6, NULL, 0, '#3DAE2B', '2026-06-08 21:38:43', '2026-06-08 21:38:43');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `centros_formacion`
--
ALTER TABLE `centros_formacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_centros_regional` (`regional_id`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `configuracion_clave_unique` (`clave`);

--
-- Indices de la tabla `dias_festivos`
--
ALTER TABLE `dias_festivos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dias_festivos_fecha_unique` (`fecha`),
  ADD KEY `idx_festivo_fecha` (`fecha`);

--
-- Indices de la tabla `fichas_caracterizacion`
--
ALTER TABLE `fichas_caracterizacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fichas_caracterizacion_numero_ficha_unique` (`numero_ficha`),
  ADD KEY `fichas_caracterizacion_programa_formacion_id_foreign` (`programa_formacion_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_centro` (`centro_formacion_id`);

--
-- Indices de la tabla `ficha_instructor`
--
ALTER TABLE `ficha_instructor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ficha_instructor` (`ficha_id`,`usuario_id`),
  ADD KEY `idx_pivot_ficha` (`ficha_id`),
  ADD KEY `idx_pivot_usuario` (`usuario_id`),
  ADD KEY `idx_gestor` (`ficha_id`,`es_gestor`);

--
-- Indices de la tabla `historial_actividad`
--
ALTER TABLE `historial_actividad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_fecha` (`creado_en`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ficha_jornada_dia` (`ficha_id`,`jornada_ficha_id`,`dia_semana`),
  ADD KEY `idx_horario_ficha` (`ficha_id`),
  ADD KEY `idx_horario_instructor` (`instructor_id`),
  ADD KEY `horarios_jornada_ficha_id_foreign` (`jornada_ficha_id`);

--
-- Indices de la tabla `importaciones_aprendices`
--
ALTER TABLE `importaciones_aprendices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_import_ficha` (`ficha_id`),
  ADD KEY `importaciones_aprendices_importado_por_foreign` (`importado_por`);

--
-- Indices de la tabla `intentos_login`
--
ALTER TABLE `intentos_login`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_correo_fecha` (`correo`,`creado_en`);

--
-- Indices de la tabla `jornadas_ficha`
--
ALTER TABLE `jornadas_ficha`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ficha_jornada` (`ficha_id`,`tipo`);

--
-- Indices de la tabla `macrorregiones`
--
ALTER TABLE `macrorregiones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `macrorregiones_nombre_unique` (`nombre`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indices de la tabla `programas_formacion`
--
ALTER TABLE `programas_formacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_programas_tipo` (`tipo`);

--
-- Indices de la tabla `regionales`
--
ALTER TABLE `regionales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `regionales_nombre_unique` (`nombre`),
  ADD KEY `idx_regionales_macrorregion` (`macrorregion_id`);

--
-- Indices de la tabla `registros_asistencia`
--
ALTER TABLE `registros_asistencia`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_sesion_aprendiz` (`sesion_id`,`aprendiz_id`),
  ADD KEY `idx_aprendiz` (`aprendiz_id`),
  ADD KEY `idx_sesion` (`sesion_id`);

--
-- Indices de la tabla `registros_asistencia_backup`
--
ALTER TABLE `registros_asistencia_backup`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_registro` (`registro_asistencia_id`),
  ADD KEY `idx_aprendiz_backup` (`aprendiz_id`),
  ADD KEY `idx_modificado` (`modificado_por`);

--
-- Indices de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_sesion_fecha_horario` (`horario_id`,`fecha`),
  ADD KEY `idx_sesion_horario` (`horario_id`),
  ADD KEY `idx_ficha_fecha` (`ficha_id`,`fecha`),
  ADD KEY `idx_instructor_fecha` (`instructor_id`,`fecha`);

--
-- Indices de la tabla `tokens_reset`
--
ALTER TABLE `tokens_reset`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tokens_reset_token_unique` (`token`),
  ADD KEY `idx_token_reset` (`token`),
  ADD KEY `idx_token_usuario` (`usuario_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuarios_correo_unique` (`correo`),
  ADD KEY `idx_rol` (`rol`),
  ADD KEY `idx_documento` (`documento`),
  ADD KEY `idx_ficha` (`ficha_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `centros_formacion`
--
ALTER TABLE `centros_formacion`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `dias_festivos`
--
ALTER TABLE `dias_festivos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `fichas_caracterizacion`
--
ALTER TABLE `fichas_caracterizacion`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `ficha_instructor`
--
ALTER TABLE `ficha_instructor`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `historial_actividad`
--
ALTER TABLE `historial_actividad`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=321;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `importaciones_aprendices`
--
ALTER TABLE `importaciones_aprendices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `intentos_login`
--
ALTER TABLE `intentos_login`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=294;

--
-- AUTO_INCREMENT de la tabla `jornadas_ficha`
--
ALTER TABLE `jornadas_ficha`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `macrorregiones`
--
ALTER TABLE `macrorregiones`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programas_formacion`
--
ALTER TABLE `programas_formacion`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `regionales`
--
ALTER TABLE `regionales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `registros_asistencia`
--
ALTER TABLE `registros_asistencia`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `registros_asistencia_backup`
--
ALTER TABLE `registros_asistencia_backup`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `tokens_reset`
--
ALTER TABLE `tokens_reset`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `centros_formacion`
--
ALTER TABLE `centros_formacion`
  ADD CONSTRAINT `centros_formacion_regional_id_foreign` FOREIGN KEY (`regional_id`) REFERENCES `regionales` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `fichas_caracterizacion`
--
ALTER TABLE `fichas_caracterizacion`
  ADD CONSTRAINT `fichas_caracterizacion_centro_formacion_id_foreign` FOREIGN KEY (`centro_formacion_id`) REFERENCES `centros_formacion` (`id`),
  ADD CONSTRAINT `fichas_caracterizacion_programa_formacion_id_foreign` FOREIGN KEY (`programa_formacion_id`) REFERENCES `programas_formacion` (`id`);

--
-- Filtros para la tabla `ficha_instructor`
--
ALTER TABLE `ficha_instructor`
  ADD CONSTRAINT `ficha_instructor_ficha_id_foreign` FOREIGN KEY (`ficha_id`) REFERENCES `fichas_caracterizacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ficha_instructor_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ficha_id_foreign` FOREIGN KEY (`ficha_id`) REFERENCES `fichas_caracterizacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `horarios_instructor_id_foreign` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `horarios_jornada_ficha_id_foreign` FOREIGN KEY (`jornada_ficha_id`) REFERENCES `jornadas_ficha` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `importaciones_aprendices`
--
ALTER TABLE `importaciones_aprendices`
  ADD CONSTRAINT `importaciones_aprendices_ficha_id_foreign` FOREIGN KEY (`ficha_id`) REFERENCES `fichas_caracterizacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `importaciones_aprendices_importado_por_foreign` FOREIGN KEY (`importado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `jornadas_ficha`
--
ALTER TABLE `jornadas_ficha`
  ADD CONSTRAINT `jornadas_ficha_ficha_id_foreign` FOREIGN KEY (`ficha_id`) REFERENCES `fichas_caracterizacion` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `regionales`
--
ALTER TABLE `regionales`
  ADD CONSTRAINT `regionales_macrorregion_id_foreign` FOREIGN KEY (`macrorregion_id`) REFERENCES `macrorregiones` (`id`);

--
-- Filtros para la tabla `registros_asistencia`
--
ALTER TABLE `registros_asistencia`
  ADD CONSTRAINT `registros_asistencia_aprendiz_id_foreign` FOREIGN KEY (`aprendiz_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `registros_asistencia_sesion_id_foreign` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD CONSTRAINT `sesiones_ficha_id_foreign` FOREIGN KEY (`ficha_id`) REFERENCES `fichas_caracterizacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sesiones_horario_id_foreign` FOREIGN KEY (`horario_id`) REFERENCES `horarios` (`id`),
  ADD CONSTRAINT `sesiones_instructor_id_foreign` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `tokens_reset`
--
ALTER TABLE `tokens_reset`
  ADD CONSTRAINT `tokens_reset_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ficha_id_foreign` FOREIGN KEY (`ficha_id`) REFERENCES `fichas_caracterizacion` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
