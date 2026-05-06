/**
 * controllers/calendarController.js
 * Gestión de la agenda y citas para la Boutique.
 * Incluye generación de reportes de ganancias y datos para el dashboard.
 */
const db = require('../config/db');

/**
 * Obtiene todas las citas activas de la agenda y calcula las ganancias totales.
 *
 * Excluye las citas marcadas como eliminadas (soft delete). Si la tabla
 * no existe, devuelve un arreglo vacío.
 *
 * @async
 * @function getAppointments
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON con los eventos del calendario (`calendarEvents`) y las ganancias totales del día (`totalEarningsPerDay`).
 */
const getAppointments = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM calendar WHERE deleted_at IS NULL ORDER BY date ASC');

        let totalEarnings = 0;
        const formatted = rows.map(r => {
            const amount = parseFloat(r.profit || 0);
            totalEarnings += amount;
            return {
                id: r.id,
                client: r.client,
                date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
                description: r.description,
                profit: amount
            };
        });

        res.status(200).json({
            calendarEvents: formatted,
            totalEarningsPerDay: totalEarnings
        });
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ calendarEvents: [], totalEarningsPerDay: 0 });
        }
        next(err);
    }
};

/**
 * Crea una nueva cita en la agenda.
 *
 * @async
 * @function createAppointment
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.client - Nombre o identificador del cliente.
 * @param {string} req.body.date - Fecha de la cita.
 * @param {string} [req.body.description] - Descripción o servicios a realizar.
 * @param {number|string} [req.body.profit] - Ganancia estimada de la cita.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON con los datos de la cita creada.
 */
const createAppointment = async (req, res, next) => {
    try {
        const { client, date, description, profit } = req.body;

        const [result] = await db.query(
            `INSERT INTO calendar (client, date, description, profit) VALUES (?, ?, ?, ?)`,
            [client, date, description || '', parseFloat(profit || 0)]
        );

        res.status(201).json({
            id: result.insertId,
            client,
            date,
            description,
            profit: parseFloat(profit || 0)
        });
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ error: 'Operación ignorada: Este tenant no soporta agenda todavía.' });
        }
        next(err);
    }
};

/**
 * Genera un reporte de ganancias para hoy, el mes y el año actual.
 *
 * @async
 * @function getEarningsReport
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.query - Parámetros de consulta (query params).
 * @param {string} [req.query.date] - Fecha base para el reporte (por defecto usa la fecha actual).
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON con los totales (`today`, `month`, `year`).
 */
const getEarningsReport = async (req, res, next) => {
    try {
        const dateStr = req.query.date || new Date().toISOString().split('T')[0];

        const [dayResult] = await db.query(`SELECT SUM(profit) as total FROM calendar WHERE DATE(date) = ? AND deleted_at IS NULL`, [dateStr]);
        const [monthResult] = await db.query(`SELECT SUM(profit) as total FROM calendar WHERE MONTH(date) = MONTH(?) AND YEAR(date) = YEAR(?) AND deleted_at IS NULL`, [dateStr, dateStr]);
        const [yearResult] = await db.query(`SELECT SUM(profit) as total FROM calendar WHERE YEAR(date) = YEAR(?) AND deleted_at IS NULL`, [dateStr]);

        res.status(200).json({
            today: parseFloat(dayResult[0].total || 0),
            month: parseFloat(monthResult[0].total || 0),
            year: parseFloat(yearResult[0].total || 0)
        });
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ today: 0, month: 0, year: 0 });
        }
        next(err);
    }
};

/**
 * Obtiene datos resumidos para el Dashboard.
 *
 * Incluye las citas de hoy, las citas de mañana y una lista de los 5
 * clientes más fieles basándose en la cantidad de visitas.
 *
 * @async
 * @function getDashboardData
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.query - Parámetros de consulta.
 * @param {string} req.query.today - Fecha de hoy.
 * @param {string} req.query.tomorrow - Fecha de mañana.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON con `today`, `tomorrow` y `topClients`.
 */
const getDashboardData = async (req, res, next) => {
    try {
        const { today, tomorrow } = req.query;

        if (!today || !tomorrow) {
            return res.status(400).json({ error: 'Faltan parámetros de fecha (today, tomorrow)' });
        }

        const [todayRows] = await db.query(
            'SELECT * FROM calendar WHERE date = ? AND deleted_at IS NULL ORDER BY description ASC',
            [today]
        );

        const [tomorrowRows] = await db.query(
            'SELECT * FROM calendar WHERE date = ? AND deleted_at IS NULL ORDER BY description ASC',
            [tomorrow]
        );

        const [topClientsRows] = await db.query(
            'SELECT client AS name, COUNT(*) AS visits FROM calendar WHERE deleted_at IS NULL GROUP BY client ORDER BY visits DESC LIMIT 5'
        );

        res.status(200).json({
            today: todayRows.map(r => ({
                id: r.id, client: r.client, time: r.description || '10:00', price: parseFloat(r.profit)
            })),
            tomorrow: tomorrowRows.map(r => ({
                id: r.id, client: r.client, time: r.description || '10:00', price: parseFloat(r.profit)
            })),
            topClients: topClientsRows
        });

    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ today: [], tomorrow: [], topClients: [] });
        }
        next(err);
    }
};

/**
 * Importa múltiples citas desde un arreglo.
 *
 * Utilizado para migraciones masivas de datos o subidas desde CSV en el frontend.
 *
 * @async
 * @function importAppointments
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {Array<Object>} [req.body.calendarEvents] - Arreglo de eventos a importar.
 * @param {Array<Object>} [req.body.appointments] - (Alternativa) Arreglo de eventos a importar.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON con el mensaje de éxito indicando la cantidad insertada.
 */
const importAppointments = async (req, res, next) => {
    try {
        const { calendarEvents } = req.body;
        const events = calendarEvents || req.body.appointments;
        if (!Array.isArray(events) || events.length === 0) {
            return res.status(400).json({ error: 'Array de citas vacío o inválido.' });
        }

        let insertedCount = 0;

        for (const apt of events) {
            const { client, date, description, profit } = apt;
            if (client && date) {
                await db.query(
                    `INSERT INTO calendar (client, date, description, profit) VALUES (?, ?, ?, ?)`,
                    [client, date, description || '', parseFloat(profit || 0)]
                );
                insertedCount++;
            }
        }

        res.status(201).json({ message: `Se importaron ${insertedCount} eventos exitosamente.` });
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ error: 'Operación ignorada: Este tenant no soporta agenda todavía.' });
        }
        next(err);
    }
};

module.exports = { getAppointments, createAppointment, getEarningsReport, getDashboardData, importAppointments };
