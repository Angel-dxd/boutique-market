-- Migración inicial para el Proyecto ARIEL
-- 1. Añadir campos personales al usuario
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_street VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_number VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_city VARCHAR(100) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_state VARCHAR(100) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_zip VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_country VARCHAR(100) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profession VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_scope VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'es';

-- 2. Adaptar la tabla de finanzas (ahora ingresos/gastos)
ALTER TABLE finance ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;
ALTER TABLE finance ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL;

-- Asegurar la clave foránea para provider_id en finance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_finance_provider') THEN
        ALTER TABLE finance ADD CONSTRAINT fk_finance_provider FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;
    END IF;
END;
$$;

-- 3. Eliminar tablas obsoletas del antiguo negocio (madre)
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS nails CASCADE;
DROP TABLE IF EXISTS calendar CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
