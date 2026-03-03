CREATE DATABASE IF NOT EXISTS boutique_market;
USE boutique_market;

-- 1. Tabla Proveedores (relacionada en Productos)
CREATE TABLE IF NOT EXISTS providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    empresa VARCHAR(255),
    categoria VARCHAR(255) DEFAULT 'Suministros'
);

-- 2. Tabla Productos (con llave foránea a proveedores)
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 5,
    categoria VARCHAR(255) DEFAULT 'General',
    proveedor_id INT,
    FOREIGN KEY (proveedor_id) REFERENCES providers(id) ON DELETE SET NULL
);

-- 3. Tabla Clientes
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tablas para Dashboard Estadístico (Finanzas y Facturas)
CREATE TABLE IF NOT EXISTS facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finanzas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'entrada' / 'salida'
    categoria VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
