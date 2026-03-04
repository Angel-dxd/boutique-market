const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { AsyncLocalStorage } = require('async_hooks');

// Entorno Asíncrono para Contexto de Inquilinos (Multitenant)
const tenantContext = new AsyncLocalStorage();

// Carga Dinámica desde config.json
const configPath = path.join(__dirname, '../../config.json');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Mapa de Pools de Conexión
const pools = {};
for (const [tenant, config] of Object.entries(configData)) {
    pools[tenant] = mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Verificación asíncrona al levantar
    pools[tenant].getConnection()
        .then(conn => {
            console.log(`✅ Pool conectado orgánicamente para Tenant: '${tenant}' [BD: ${config.database}]`);
            conn.release();
        })
        .catch(err => console.error(`❌ Error en pool de tenant '${tenant}':`, err.message));
}

// Interceptor de Base de Datos Dinámico
const db = {
    query: async (sql, params) => {
        // Identificar quién pide la consulta, sino, por defecto market
        const tenant = tenantContext.getStore() || 'market';
        const pool = pools[tenant] || pools['market'];
        return pool.query(sql, params);
    },
    // Exponer el contexto para el Middleware en server.js
    tenantContext
};

module.exports = db;