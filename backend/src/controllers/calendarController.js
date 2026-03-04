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
        // Si no existe la tabla, respondemos sin romper el servidor
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ error: 'Operación ignorada: Este tenant no soporta agenda todavía.' });
        }
        next(err);
    }
};

module.exports = { getAppointments, createAppointment };
