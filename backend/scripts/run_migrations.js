/**
 * scripts/run_migrations.js
 * Ejecuta migraciones de BD para el proyecto ARIEL.
 * Se ejecuta automáticamente al arrancar el servidor (server.js).
 * Es idempotente: usa IF NOT EXISTS / IF EXISTS para no fallar si ya están aplicadas.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const migrations = [
    // Asegurar columnas personales en users (por si la BD viene del schema base)
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address_street VARCHAR(255) DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address_number VARCHAR(50) DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address_city VARCHAR(100) DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address_state VARCHAR(100) DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address_zip VARCHAR(50) DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address_country VARCHAR(100) DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS profession VARCHAR(255) DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_scope VARCHAR(255) DEFAULT NULL;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'es';`,

    // Asegurar columnas extendidas en finance
    `ALTER TABLE finance ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;`,
    `ALTER TABLE finance ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL;`,

    // Asegurar FK de finance → providers
    `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_finance_provider') THEN
            ALTER TABLE finance ADD CONSTRAINT fk_finance_provider 
                FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;
        END IF;
    END;
    $$;
    `,

    // Asegurar columna expiration_date en inventory
    `ALTER TABLE inventory ADD COLUMN IF NOT EXISTS expiration_date DATE DEFAULT NULL;`,
];

async function execute() {
    const connStr = process.env.DATABASE_URL_ARIEL;

    if (!connStr || connStr.includes('<ref>') || connStr.includes('<password>')) {
        console.warn('⚠️  DATABASE_URL_ARIEL no configurado o contiene plantillas. Saltando migraciones.');
        return;
    }

    console.log('🚀 Iniciando migraciones ARIEL...');
    const pool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false }
    });

    try {
        for (const sql of migrations) {
            const preview = sql.trim().split('\n')[0].substring(0, 80);
            console.log(`⚡ ${preview}...`);
            await pool.query(sql);
        }
        console.log('✅ Migraciones ARIEL completadas con éxito.');
    } catch (err) {
        console.error(`❌ ERROR en migración ARIEL: ${err.message}`);
        // No relanzamos el error: si el schema ya está correcto, el servidor debe seguir
    } finally {
        await pool.end();
    }

    console.log('🏁 Proceso de migración finalizado.');
}

if (require.main === module) {
    execute();
}

module.exports = execute;
