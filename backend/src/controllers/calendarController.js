/**
 * controllers/calendarController.js
 * Gestión de la agenda y citas para la Boutique.
 * Incluye generación de reportes de ganancias y datos para el dashboard.
 */
const db = require('../config/db');

/**
 * Obtiene todas las citas activas y calcula las ganancias totales.
 * @route GET /api/calendar
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
 * @route POST /api/calendar
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
 * @route GET /api/calendar/earnings
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
 * Obtiene datos resumidos para el Dashboard (citas de hoy, mañana y clientes fieles).
 * @route GET /api/calendar/dashboard
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
 * Importa múltiples citas desde un array (útil para migración de datos).
 * @route POST /api/calendar/import
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
