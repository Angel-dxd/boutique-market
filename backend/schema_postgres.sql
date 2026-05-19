-- ============================================================
-- Boutique Market — Schema PostgreSQL (Supabase) definitivo
-- Convención: snake_case, inglés técnico
-- Compatible con Supabase o cualquier base de datos PostgreSQL
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
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255)    NOT NULL,
    price       DECIMAL(10,2)   NOT NULL,
    cost        DECIMAL(10,2)   DEFAULT 0.00,
    stock       INT             DEFAULT 0,
    min_stock   INT             DEFAULT 5,
    category    VARCHAR(255)    DEFAULT 'General',
    provider_id INT             DEFAULT NULL,
    expiration_date DATE        DEFAULT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_provider
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_inventory_provider ON inventory(provider_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(stock);

-- ------------------------------------------------------------
-- INVOICES — Facturas de compra a proveedores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id          SERIAL PRIMARY KEY,
    provider_id INT             DEFAULT NULL,
    amount      DECIMAL(10,2)   NOT NULL,
    reference   VARCHAR(255)    DEFAULT NULL,
    date        DATE            NOT NULL DEFAULT CURRENT_DATE,
    status      VARCHAR(50)     DEFAULT 'pending',
    tax_included BOOLEAN        DEFAULT TRUE,
    tax_amount  DECIMAL(10,2)   DEFAULT 0.00,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoices_provider
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_invoices_provider ON invoices(provider_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);

-- ------------------------------------------------------------
-- CLIENTS — Cartera de clientas recurrentes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    phone       VARCHAR(20)     DEFAULT NULL,
    email       VARCHAR(150)    DEFAULT NULL,
    notes       TEXT            DEFAULT NULL,
    last_visit  DATE            DEFAULT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP       NULL DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_last_visit ON clients(last_visit);

-- ------------------------------------------------------------
-- CALENDAR — Agenda de citas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendar (
    id          SERIAL PRIMARY KEY,
    client      VARCHAR(255)    NOT NULL,
    date        DATE            NOT NULL,
    description VARCHAR(255)    DEFAULT NULL,
    profit      DECIMAL(10,2)   DEFAULT 0.00,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP       NULL DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar(date);
CREATE INDEX IF NOT EXISTS idx_calendar_client ON calendar(client);

-- ------------------------------------------------------------
-- FINANCE — Registro de ingresos y gastos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS finance (
    id          SERIAL PRIMARY KEY,
    amount      DECIMAL(10,2)   NOT NULL,
    type        VARCHAR(50)     NOT NULL,
    category    VARCHAR(255)    DEFAULT NULL,
    date        DATE            NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance(date);
CREATE INDEX IF NOT EXISTS idx_finance_type ON finance(type);

-- ------------------------------------------------------------
-- GALLERY — Portfolio de trabajos de manicura
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255)    NOT NULL,
    category    VARCHAR(255)    DEFAULT NULL,
    image       TEXT            DEFAULT NULL,
    client_id   INT             DEFAULT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_gallery_client
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- NAILS — Galería rápida de diseños de uñas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nails (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255)    NOT NULL,
    imageUrl    TEXT            NOT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- USERS — Autenticación por tenant
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(100)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    email       TEXT            DEFAULT NULL,
    role        VARCHAR(50)     DEFAULT 'user',
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Usuarios iniciales (Passwords: arelys123 / santi123)
-- Hash bcrypt real generado para el primer acceso
INSERT INTO users (username, password, role) VALUES 
('arelys', '$2b$10$u5B3TIaqePMksf6iHVH6KuVzoAW./VIL250kPCVGOIeq1SC65MBwy', 'user'),
('santi', '$2b$10$K3L7hHzSftB35/3Ofip.PudEY00k5ENiLYdm1KQlfRdBrTOSOwuFK', 'user')
ON CONFLICT (username) DO NOTHING;

