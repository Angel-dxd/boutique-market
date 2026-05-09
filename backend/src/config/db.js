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
    const envVar = `DATABASE_URL_${tenant.toUpperCase()}`;
    const connStr = process.env[envVar];
    
    if (connStr) {
        console.log(`📡 Inicializando pool para tenant '${tenant}' usando ${envVar}...`);
        pools[tenant] = new Pool({
            connectionString: connStr,
            ssl: { rejectUnauthorized: false },
            max: 10, // Máximo de conexiones por pool
            idleTimeoutMillis: 30000, // Tiempo antes de cerrar una conexión inactiva
            connectionTimeoutMillis: 5000, // Tiempo máximo para establecer conexión
        });

        // Test de conexión inmediato para logs de arranque
        pools[tenant].connect()
            .then(c => { 
                console.log(`✅ ¡ÉXITO! Pool conectado a Supabase para tenant '${tenant}'`); 
                c.release(); 
            })
            .catch(err => {
                console.error(`❌ ERROR de conexión en tenant '${tenant}':`);
                console.error(`   Detalle: ${err.message}`);
                console.error(`   ¿Están bien las credenciales en ${envVar}?`);
            });
    } else {
        console.warn(`⚠️ ADVERTENCIA: La variable ${envVar} no está definida.`);
        console.warn(`   El backend intentará arrancar, pero las consultas a '${tenant}' fallarán.`);
    }
}

// Caché para traducciones SQL (Turbo Translator)
const sqlCache = new Map();

/**
 * Traduce sintaxis MySQL → PostgreSQL con caché.
 * @param {string} sql
 * @returns {string} SQL adaptado a Postgres.
 */
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
