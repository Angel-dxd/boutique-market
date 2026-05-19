/**
 * scripts/run_migrations.js
 * Script para ejecutar las migraciones de base de datos multitenant.
 * Intenta aplicar de forma segura e idempotente las nuevas columnas en Oh-Nails y El Gallo Azul.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const tenants = ['market', 'santi'];

const migrations = {
    market: [
        `ALTER TABLE gallery ADD COLUMN IF NOT EXISTS client_id INT DEFAULT NULL;`,
        `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_gallery_client'
            ) THEN
                ALTER TABLE gallery ADD CONSTRAINT fk_gallery_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
            END IF;
        END $$;
        `
    ],
    santi: [
        `ALTER TABLE inventory ADD COLUMN IF NOT EXISTS expiration_date DATE DEFAULT NULL;`,
        `ALTER TABLE gallery ADD COLUMN IF NOT EXISTS client_id INT DEFAULT NULL;`,
        `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_gallery_client'
            ) THEN
                ALTER TABLE gallery ADD CONSTRAINT fk_gallery_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
            END IF;
        END $$;
        `
    ]
};

async function execute() {
    console.log('🚀 Iniciando ejecutor de migraciones para Boutique Market...');
    
    for (const tenant of tenants) {
        const envVar = `DATABASE_URL_${tenant.toUpperCase()}`;
        const connStr = process.env[envVar];
        
        if (!connStr || connStr.includes('<ref>') || connStr.includes('<password>')) {
            console.warn(`⚠️ Saltando migración para '${tenant}' (DATABASE_URL no configurado o contiene plantillas).`);
            continue;
        }

        console.log(`📡 Conectando a Supabase para tenant '${tenant}'...`);
        const pool = new Pool({
            connectionString: connStr,
            ssl: { rejectUnauthorized: false }
        });

        try {
            const queries = migrations[tenant] || [];
            for (const sql of queries) {
                console.log(`⚡ Ejecutando en '${tenant}':\n   ${sql.trim().split('\n')[0]}...`);
                await pool.query(sql);
            }
            console.log(`✅ Migración completada con éxito para '${tenant}'.\n`);
        } catch (err) {
            console.error(`❌ ERROR al migrar '${tenant}': ${err.message}\n`);
        } finally {
            await pool.end();
        }
    }
    
    console.log('🏁 Proceso de migración finalizado.');
}

if (require.main === module) {
    execute();
}

module.exports = execute;
