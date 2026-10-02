/**
 * Configuración de Base de Datos — Postgres (Supabase).
 *
 * Capa de compatibilidad: este módulo expone una API equivalente a la de
 * mysql2/promise para minimizar los cambios necesarios en los controllers
 * existentes. Internamente usa el driver `pg` y traduce automáticamente:
 *
 *   - Placeholders `?`           →  `$1, $2, ...`
 *   - `CURDATE()`                →  `CURRENT_DATE`
 *   - `DATEDIFF(a, b)`           →  `(a::date - b::date)`
 *   - `DATE(x)`                  →  `(x)::date`
 *   - `MONTH(x)` / `YEAR(x)`     →  `EXTRACT(MONTH FROM x)` / `EXTRACT(YEAR FROM x)`
 *   - INSERTs sin RETURNING      →  añade `RETURNING id` para obtener insertId
 *
 * El objeto devuelto a los controllers conserva el patrón
 * `const [rows] = await db.query(...)` y expone `rows.affectedRows`,
 * `rows.insertId` cuando aplica.
 */
const { Pool } = require('pg');

const connStr = process.env.DATABASE_URL_ARIEL;
let pool;

if (connStr) {
    console.log(`📡 Inicializando pool para 'ariel'...`);
    pool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000, 
        connectionTimeoutMillis: 5000,
        keepAlive: true, 
    });

    pool.query('SELECT 1')
        .then(() => { 
            console.log(`✅ ¡Conexión verificada con éxito para 'ariel'!`); 
        })
        .catch(err => {
            console.error(`❌ ERROR de conexión inicial: ${err.message}`);
        });
} else {
    console.warn(`⚠️ ADVERTENCIA: La variable DATABASE_URL_ARIEL no está definida.`);
}

// Caché para traducciones SQL (Turbo Translator)
const sqlCache = new Map();

function adaptSql(sql) {
    if (sqlCache.has(sql)) return sqlCache.get(sql);

    let out = sql;
    out = out.replace(/\bCURDATE\(\)/gi, 'CURRENT_DATE');
    out = out.replace(/\bDATEDIFF\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/gi, '(($1)::date - ($2)::date)');
    out = out.replace(/\bMONTH\s*\(\s*([^)]+?)\s*\)/gi, 'EXTRACT(MONTH FROM ($1)::date)');
    out = out.replace(/\bYEAR\s*\(\s*([^)]+?)\s*\)/gi, 'EXTRACT(YEAR FROM ($1)::date)');
    out = out.replace(/\bDATE\s*\(\s*([^)]+?)\s*\)/gi, '($1)::date');

    let n = 0;
    out = out.replace(/\?/g, () => `$${++n}`);

    if (/^\s*INSERT\s+INTO/i.test(out) && !/\bRETURNING\b/i.test(out)) {
        out = out.trim().replace(/;?\s*$/, '') + ' RETURNING id';
    }

    sqlCache.set(sql, out);
    return out;
}

async function runQuery(sql, params = []) {
    if (!pool) throw new Error("La base de datos no está inicializada (DATABASE_URL_ARIEL).");

    const adapted = adaptSql(sql);
    const result = await pool.query(adapted, params);

    const rows = result.rows;
    Object.defineProperty(rows, 'affectedRows', { value: result.rowCount, enumerable: false });
    Object.defineProperty(rows, 'insertId', { value: rows[0]?.id ?? null, enumerable: false });

    return [rows, result.fields];
}

const db = {
    query: runQuery,
    execute: runQuery,
};

module.exports = db;
