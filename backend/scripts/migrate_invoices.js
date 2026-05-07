require('dotenv').config();
const mysql = require('mysql2/promise');
const config = require('../config.json');

async function runMigration() {
    const tenants = ['market', 'santi'];
    
    for (const tenant of tenants) {
        const dbConfig = config[tenant];
        console.log(`Migrating database: ${dbConfig.database}...`);
        try {
            const connection = await mysql.createConnection({
                host: dbConfig.host,
                user: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database,
                port: 3306
            });

            // Añadir las columnas si no existen
            try {
                await connection.query(`ALTER TABLE invoices ADD COLUMN status VARCHAR(50) DEFAULT 'pending'`);
                console.log(` - Añadida columna 'status' a ${dbConfig.database}.invoices`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(` - Columna 'status' ya existe en ${dbConfig.database}.invoices`);
                } else {
                    throw e;
                }
            }

            try {
                await connection.query(`ALTER TABLE invoices ADD COLUMN tax_included BOOLEAN DEFAULT TRUE`);
                console.log(` - Añadida columna 'tax_included' a ${dbConfig.database}.invoices`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(` - Columna 'tax_included' ya existe en ${dbConfig.database}.invoices`);
                } else {
                    throw e;
                }
            }

            await connection.end();
            console.log(`✅ Migración completada para ${dbConfig.database}`);
        } catch (error) {
            console.error(`❌ Error migrando ${dbConfig.database}:`, error.message);
        }
    }
}

runMigration();
