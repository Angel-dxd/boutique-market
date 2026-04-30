-- ============================================================
-- Boutique Market — Schema MySQL definitivo
-- Convención: snake_case, inglés técnico, InnoDB, utf8mb4
-- Compatible con: boutique_db (tenant: santi) y market_db (tenant: market)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- PROVIDERS — Proveedores del negocio
-- Usado principalmente por: market (El Gallo Azul)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS providers (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    phone       VARCHAR(50)     DEFAULT NULL,
    company     VARCHAR(255)    DEFAULT NULL,
    category    VARCHAR(255)    DEFAULT 'Suministros',
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_providers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- INVENTORY — Productos en stock
-- Usado principalmente por: market (El Gallo Azul)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255)    NOT NULL,
    price       DECIMAL(10,2)   NOT NULL,
    cost        DECIMAL(10,2)   DEFAULT 0.00,
    stock       INT             DEFAULT 0,
    min_stock   INT             DEFAULT 5,
    category    VARCHAR(255)    DEFAULT 'General',
    provider_id INT             DEFAULT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_provider
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL,

    INDEX idx_inventory_provider (provider_id),
    INDEX idx_inventory_stock    (stock)        -- acelera consultas de alertas de reposición
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- INVOICES — Facturas de compra a proveedores
-- Usado principalmente por: market (El Gallo Azul)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT             DEFAULT NULL,
    amount      DECIMAL(10,2)   NOT NULL,
    reference   VARCHAR(255)    DEFAULT NULL,
    date        DATE            NOT NULL DEFAULT (CURDATE()),
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoices_provider
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL,

    INDEX idx_invoices_provider (provider_id),
    INDEX idx_invoices_date     (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- CLIENTS — Cartera de clientas recurrentes
-- Usado principalmente por: boutique (Oh-Nails)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    phone       VARCHAR(20)     DEFAULT NULL,
    email       VARCHAR(150)    DEFAULT NULL,  -- almacenado cifrado con AES-256-CBC (PSyP-4)
    notes       TEXT            DEFAULT NULL,
    last_visit  DATE            DEFAULT NULL,  -- NULL hasta la primera visita real
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP       NULL DEFAULT NULL,

    INDEX idx_clients_name       (name),
    INDEX idx_clients_last_visit (last_visit)   -- acelera consultas de fidelización
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- CALENDAR — Agenda de citas
-- Usado principalmente por: boutique (Oh-Nails)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendar (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    client      VARCHAR(255)    NOT NULL,
    date        DATE            NOT NULL,
    description VARCHAR(255)    DEFAULT NULL,
    profit      DECIMAL(10,2)   DEFAULT 0.00,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP       NULL DEFAULT NULL,

    INDEX idx_calendar_date   (date),
    INDEX idx_calendar_client (client)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- FINANCE — Registro de ingresos y gastos
-- Usado principalmente por: boutique (Oh-Nails)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS finance (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    amount      DECIMAL(10,2)   NOT NULL,
    type        VARCHAR(50)     NOT NULL,       -- 'income' | 'expense'
    category    VARCHAR(255)    DEFAULT NULL,
    date        DATE            NOT NULL DEFAULT (CURDATE()),
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_finance_date (date),
    INDEX idx_finance_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- GALLERY — Portfolio de trabajos de manicura
-- Usado principalmente por: boutique (Oh-Nails)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255)    NOT NULL,
    category    VARCHAR(255)    DEFAULT NULL,
    image       LONGTEXT        DEFAULT NULL,   -- base64 o URL
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- NAILS — Galería rápida de diseños de uñas (endpoint /api/nails)
-- Usado principalmente por: boutique (Oh-Nails)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nails (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255)    NOT NULL,
    imageUrl    TEXT            NOT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- USERS — Autenticación por tenant
-- Cada tenant tiene su propia tabla users en su propia BD
-- Contraseña: hash Bcrypt (10 salt rounds) — PSyP-5
-- Email: cifrado AES-256-CBC — PSyP-4
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,       -- Bcrypt hash
    email       TEXT            DEFAULT NULL,   -- AES-256-CBC encrypted
    role        VARCHAR(50)     DEFAULT 'user', -- 'admin' | 'user'
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- INSTRUCCIONES DE INSTALACIÓN
-- ============================================================
-- 1. Crear las dos bases de datos (una por tenant):
--
--    mysql -u root -p -e "CREATE DATABASE boutique_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
--    mysql -u root -p -e "CREATE DATABASE market_db   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
--
-- 2. Aplicar este schema a cada una:
--
--    mysql -u root -p boutique_db < schema.sql
--    mysql -u root -p market_db   < schema.sql
--
-- 3. Asegurarse de que config.json apunta a cada BD correctamente.
-- ============================================================