const { Pool } = require('pg');
const fs = require('fs');

const connStr = process.env.DATABASE_URL_ARIEL || 'postgresql://postgres:postgres@localhost:5432/postgres';

const pool = new Pool({ connectionString: connStr });

async function run() {
    try {
        const sql = fs.readFileSync('migration_ariel.sql', 'utf8');
        await pool.query(sql);
        console.log("Migración aplicada exitosamente.");
    } catch (e) {
        console.error("Error en migración:", e);
    } finally {
        pool.end();
    }
}
run();
