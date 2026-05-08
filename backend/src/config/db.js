/**
 * Configuración de Base de Datos Multi-tenant — Postgres (Supabase).
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
const { AsyncLocalStorage } = require('async_hooks');

const tenantContext = new AsyncLocalStorage();
const tenants = ['market', 'santi'];
const pools = {};

for (const tenant of tenants) {
    const connStr = process.env[`DATABASE_URL_${tenant.toUpperCase()}`];
    
    if (connStr) {
        pools[tenant] = new Pool({
            connectionString: connStr,
            ssl: { rejectUnauthorized: false }
        });

        pools[tenant].connect()
            .then(c => { console.log(`✅ Pool conectado: tenant '${tenant}'`); c.release(); })
            .catch(err => console.error(`❌ Error tenant '${tenant}':`, err.message));
    } else {
        console.warn(`⚠️ Advertencia: Variable de entorno DATABASE_URL_${tenant.toUpperCase()} no definida.`);
    }
}

/**
 * Traduce sintaxis MySQL → PostgreSQL.
 * @param {string} sql
 * @returns {string} SQL adaptado a Postgres.
 */
function adaptSql(sql) {
    let out = sql;

    // Funciones de fecha MySQL → Postgres.
    // Se añade siempre un cast `::date` interno: si el argumento ya es un campo
    // tipo date el cast es no-op; si es un placeholder con string ('YYYY-MM-DD')
    // el cast lo convierte correctamente y evita el error
    // "function pg_catalog.extract(unknown, unknown) is not unique".
    out = out.replace(/\bCURDATE\(\)/gi, 'CURRENT_DATE');
    out = out.replace(/\bDATEDIFF\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/gi, '(($1)::date - ($2)::date)');
    out = out.replace(/\bMONTH\s*\(\s*([^)]+?)\s*\)/gi, 'EXTRACT(MONTH FROM ($1)::date)');
    out = out.replace(/\bYEAR\s*\(\s*([^)]+?)\s*\)/gi, 'EXTRACT(YEAR FROM ($1)::date)');
    out = out.replace(/\bDATE\s*\(\s*([^)]+?)\s*\)/gi, '($1)::date');

    // Placeholders ? → $1, $2, ...
    let n = 0;
    out = out.replace(/\?/g, () => `$${++n}`);

    // INSERT sin RETURNING → añadir RETURNING id (idempotente)
    if (/^\s*INSERT\s+INTO/i.test(out) && !/\bRETURNING\b/i.test(out)) {
        out = out.trim().replace(/;?\s*$/, '') + ' RETURNING id';
    }

    return out;
}

/**
 * Ejecuta una consulta y devuelve resultados con shape compatible con mysql2.
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<[Array, Object]>}
 */
async function runQuery(sql, params = []) {
    const tenant = tenantContext.getStore() || 'market';
    const pool = pools[tenant] || pools['market'];

    const adapted = adaptSql(sql);
    const result = await pool.query(adapted, params);

    // Devolvemos el array de filas pero le adjuntamos metadatos para
    // mantener compatibilidad con el código que espera `result.affectedRows`
    // o `result.insertId` (estilo mysql2).
    const rows = result.rows;
    Object.defineProperty(rows, 'affectedRows', { value: result.rowCount, enumerable: false });
    Object.defineProperty(rows, 'insertId', { value: rows[0]?.id ?? null, enumerable: false });

    return [rows, result.fields];
}

const db = {
    query: runQuery,
    execute: runQuery,
    tenantContext
};

module.exports = db;
