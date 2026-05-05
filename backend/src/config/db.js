/**
 * Configuración de Base de Datos y Lógica Multitenant.
 * Utiliza AsyncLocalStorage para gestionar el contexto de base de datos de forma aislada
 * por cada petición HTTP sin necesidad de pasar el tenantId por todos los controladores.
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { AsyncLocalStorage } = require('async_hooks');

/**
 * Entorno Asíncrono para Contexto de Inquilinos (Multitenant).
 * Almacena el ID del tenant ('market' o 'santi') para la ejecución actual.
 */
const tenantContext = new AsyncLocalStorage();

/**
 * Carga de configuración desde config.json.
 * Contiene las credenciales para cada base de datos (tenant).
 */
const configPath = path.join(__dirname, '../../config.json');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * Mapa de Pools de Conexión.
 * Se crea un pool independiente para cada base de datos definida en el config.json.
 */
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

/**
 * Interceptor de Base de Datos Dinámico.
 * Actúa como un proxy que selecciona automáticamente el pool de conexiones
 * basándose en el contexto del tenant de la petición actual.
 */
const db = {
    /**
     * Ejecuta una consulta SQL genérica.
     * @param {string} sql - La sentencia SQL.
     * @param {Array} params - Parámetros para la consulta preparada.
     * @returns {Promise<Array>} Resultado de la consulta.
     */
    query: async (sql, params) => {
        const tenant = tenantContext.getStore() || 'market';
        const pool = pools[tenant] || pools['market'];
        return pool.query(sql, params);
    },

    /**
     * Ejecuta una sentencia SQL preparada.
     * @param {string} sql - La sentencia SQL.
     * @param {Array} params - Parámetros.
     * @returns {Promise<Array>} Resultado de la ejecución.
     */
    execute: async (sql, params) => {
        const tenant = tenantContext.getStore() || 'market';
        const pool = pools[tenant] || pools['market'];
        return pool.execute(sql, params);
    },

    /**
     * Exponemos el contexto para que el middleware de server.js pueda setear el tenant.
     */
    tenantContext
};

module.exports = db;