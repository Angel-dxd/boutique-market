-- ============================================================
-- Estructura Base (Backup Legacy)
-- Base de datos: boutique_market
-- ============================================================
-- Este archivo contiene la estructura base heredada sin comentarios extraños.
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'e9e78ad4-171f-11f1-b0a2-a75ee150eba9:1-10';

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `notes` text,
  `last_visit` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
CREATE TABLE `facturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `monto` decimal(10,2) NOT NULL,
  `descripcion` text,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `finanzas`
--

DROP TABLE IF EXISTS `finanzas`;
CREATE TABLE `finanzas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `monto` decimal(10,2) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost` decimal(10,2) DEFAULT '0.00',
  `stock` int DEFAULT '0',
  `min_stock` int DEFAULT '5',
  `categoria` varchar(255) DEFAULT 'General',
  `proveedor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `providers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `providers`
--

DROP TABLE IF EXISTS `providers`;
CREATE TABLE `providers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `empresa` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT 'Suministros',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;


-- Dump completed on 2026-03-03 18:13:43
