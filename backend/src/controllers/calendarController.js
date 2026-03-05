const db = require('../config/db');

// Obtener Citas y sumar ganancias
const getAppointments = async (req, res, next) => {
    try {
        // Aprovecha la conexión dinámica configurada con x-tenant-id para aislar los datos
        const [rows] = await db.query('SELECT * FROM appointments ORDER BY fecha ASC');

        let totalEarnings = 0;
        const formatted = rows.map(r => {
            const amount = parseFloat(r.ganancia || 0);
            totalEarnings += amount;
            return {
                id: r.id,
                cliente: r.cliente,
                // Formateamos fecha a YYYY-MM-DD aislando la hora
                fecha: r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : r.fecha,
                descripcion: r.descripcion,
                ganancia: amount
            };
        });

        res.status(200).json({
            citas: formatted,
            gananciasTotalesDelDia: totalEarnings
        });
    } catch (err) {
        // Prevención de Errores: si el tenant (como santi) no tiene la tabla 'appointments'
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ citas: [], gananciasTotalesDelDia: 0 });
        }
        next(err);
    }
};

// Guardar nueva Cita
const createAppointment = async (req, res, next) => {
    try {
        const { cliente, fecha, descripcion, ganancia } = req.body;

        const [result] = await db.query(
            `INSERT INTO appointments (cliente, fecha, descripcion, ganancia) VALUES (?, ?, ?, ?)`,
            [cliente, fecha, descripcion || '', parseFloat(ganancia || 0)]
        );

        res.status(201).json({
            id: result.insertId,
            cliente,
            fecha,
            descripcion,
            ganancia: parseFloat(ganancia || 0)
        });
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ error: 'Operación ignorada: Este tenant no soporta agenda todavía.' });
        }
        next(err);
    }
};

// Generador del Reporte de Ganancias Estructurado
const getEarningsReport = async (req, res, next) => {
    try {
        const dateStr = req.query.date || new Date().toISOString().split('T')[0];

        // Consultas agrupadas nativamente en MySQL segmentando por el tenant actual
        const [dayResult] = await db.query(`SELECT SUM(ganancia) as total FROM appointments WHERE DATE(fecha) = ?`, [dateStr]);
        const [monthResult] = await db.query(`SELECT SUM(ganancia) as total FROM appointments WHERE MONTH(fecha) = MONTH(?) AND YEAR(fecha) = YEAR(?)`, [dateStr, dateStr]);
        const [yearResult] = await db.query(`SELECT SUM(ganancia) as total FROM appointments WHERE YEAR(fecha) = YEAR(?)`, [dateStr]);

        res.status(200).json({
            hoy: parseFloat(dayResult[0].total || 0),
            mes: parseFloat(monthResult[0].total || 0),
            ano: parseFloat(yearResult[0].total || 0)
        });
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ hoy: 0, mes: 0, ano: 0 });
        }
        next(err);
    }
};

// Obtener datos resumidos para el Dashboard (Hoy, Mañana, Mis Fieles)
const getDashboardData = async (req, res, next) => {
    try {
        const { today, tomorrow } = req.query;

        if (!today || !tomorrow) {
            return res.status(400).json({ error: 'Faltan parámetros de fecha (today, tomorrow)' });
        }

        const [todayRows] = await db.query(
            'SELECT * FROM appointments WHERE fecha = ? ORDER BY descripcion ASC',
            [today]
        );

        const [tomorrowRows] = await db.query(
            'SELECT * FROM appointments WHERE fecha = ? ORDER BY descripcion ASC',
            [tomorrow]
        );

        // Top 5 Clientes (Mis Fieles) basado puramente en historial de citas
        const [topClientsRows] = await db.query(
            'SELECT cliente AS name, COUNT(*) AS visits FROM appointments GROUP BY cliente ORDER BY visits DESC LIMIT 5'
        );

        res.status(200).json({
            today: todayRows.map(r => ({
                id: r.id, client: r.cliente, time: r.descripcion || '10:00', price: parseFloat(r.ganancia)
            })),
            tomorrow: tomorrowRows.map(r => ({
                id: r.id, client: r.cliente, time: r.descripcion || '10:00', price: parseFloat(r.ganancia)
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

// Importar múltiples citas de golpe (CSV a MySQL)
const importAppointments = async (req, res, next) => {
    try {
        const { appointments } = req.body;
        if (!Array.isArray(appointments) || appointments.length === 0) {
            return res.status(400).json({ error: 'Array de citas vacío o inválido.' });
        }

        let insertedCount = 0;

        // Iteramos las citas y las insertamos (Aprovechando que db.query usará la misma conexión del tenant en curso)
        for (const apt of appointments) {
            const { cliente, fecha, descripcion, ganancia } = apt;
            if (cliente && fecha) {
                await db.query(
                    `INSERT INTO appointments (cliente, fecha, descripcion, ganancia) VALUES (?, ?, ?, ?)`,
                    [cliente, fecha, descripcion || '', parseFloat(ganancia || 0)]
                );
                insertedCount++;
            }
        }

        res.status(201).json({ message: `Se importaron ${insertedCount} citas exitosamente.` });
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ error: 'Operación ignorada: Este tenant no soporta agenda todavía.' });
        }
        next(err);
    }
};

module.exports = { getAppointments, createAppointment, getEarningsReport, getDashboardData, importAppointments };
