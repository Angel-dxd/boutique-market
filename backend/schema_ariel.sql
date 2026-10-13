-- ============================================================
-- ARIEL — Schema PostgreSQL Definitivo (Supabase)
-- Ejecuta este archivo completo en el SQL Editor de Supabase
-- Proyecto: Ariel Market (negocio personal de Arelys)
-- ============================================================

-- ------------------------------------------------------------
-- PROVIDERS — Proveedores del negocio
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS providers (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    phone       VARCHAR(50)     DEFAULT NULL,
    company     VARCHAR(255)    DEFAULT NULL,
    category    VARCHAR(255)    DEFAULT 'Suministros',
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_providers_name ON providers(name);

-- ------------------------------------------------------------
-- INVENTORY — Productos en stock
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    price           DECIMAL(10,2)   NOT NULL,
    cost            DECIMAL(10,2)   DEFAULT 0.00,
    stock           INT             DEFAULT 0,
    min_stock       INT             DEFAULT 5,
    category        VARCHAR(255)    DEFAULT 'General',
    provider_id     INT             DEFAULT NULL,
    expiration_date DATE            DEFAULT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_provider
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_inventory_provider ON inventory(provider_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(stock);

-- ------------------------------------------------------------
-- INVOICES — Facturas de compra a proveedores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id           SERIAL PRIMARY KEY,
    provider_id  INT             DEFAULT NULL,
    amount       DECIMAL(10,2)   NOT NULL,
    reference    VARCHAR(255)    DEFAULT NULL,
    date         DATE            NOT NULL DEFAULT CURRENT_DATE,
    status       VARCHAR(50)     DEFAULT 'pending',
    tax_included BOOLEAN         DEFAULT TRUE,
    tax_amount   DECIMAL(10,2)   DEFAULT 0.00,
    created_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoices_provider
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_invoices_provider ON invoices(provider_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);

-- ------------------------------------------------------------
-- FINANCE — Registro de ingresos y gastos (módulo principal)
-- Con columnas extendidas para ARIEL
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS finance (
    id          SERIAL PRIMARY KEY,
    amount      DECIMAL(10,2)   NOT NULL,
    type        VARCHAR(50)     NOT NULL,   -- 'income' | 'expense'
    category    VARCHAR(255)    DEFAULT NULL,
    date        DATE            NOT NULL DEFAULT CURRENT_DATE,
    description TEXT            DEFAULT NULL,
    provider_id INT             DEFAULT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_finance_provider
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance(date);
CREATE INDEX IF NOT EXISTS idx_finance_type ON finance(type);

-- ------------------------------------------------------------
-- USERS — Autenticación
-- Con campos personales extendidos para ARIEL
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    username            VARCHAR(100)    NOT NULL UNIQUE,
    password            VARCHAR(255)    NOT NULL,
    email               TEXT            DEFAULT NULL,
    role                VARCHAR(50)     DEFAULT 'user',
    -- Datos personales (módulo Perfil)
    full_name           VARCHAR(255)    DEFAULT NULL,
    birth_date          DATE            DEFAULT NULL,
    gender              VARCHAR(50)     DEFAULT NULL,
    address_street      VARCHAR(255)    DEFAULT NULL,
    address_number      VARCHAR(50)     DEFAULT NULL,
    address_city        VARCHAR(100)    DEFAULT NULL,
    address_state       VARCHAR(100)    DEFAULT NULL,
    address_zip         VARCHAR(50)     DEFAULT NULL,
    address_country     VARCHAR(100)    DEFAULT NULL,
    profession          VARCHAR(255)    DEFAULT NULL,
    professional_scope  VARCHAR(255)    DEFAULT NULL,
    language            VARCHAR(10)     DEFAULT 'es',
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- USUARIO INICIAL (contraseña: ariel123)
-- Hash bcrypt generado con 10 rounds
-- ============================================================
INSERT INTO users (username, password, role)
VALUES ('ariel', '$2a$10$ezPQP8WWFN0lzoiBWtP5Xeq47L.7V8y.NnjP36bS9Cdrigj/Kta76', 'user')
ON CONFLICT (username) DO NOTHING;
