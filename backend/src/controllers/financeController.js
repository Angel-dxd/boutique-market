/**
 * controllers/financeController.js
 * Gestión de finanzas y transacciones (ingresos y gastos).
 */
const db = require('../config/db');

/**
 * Obtiene el historial completo de transacciones financieras.
 *
 * Mapea los resultados al formato estándar esperado por el frontend.
 *
 * @async
 * @function getTransactions
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un JSON con el listado de transacciones.
 */
const getTransactions = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM finance ORDER BY date DESC');
        // Mapeo al formato estándar del frontend
        const transactions = rows.map(r => ({
            id: r.id,
            amount: r.amount,
            type: r.type,
            category: r.category,
            date: r.date
        }));
        res.status(200).json(transactions);
    } catch (err) { next(err); }
};

/**
 * Registra una nueva transacción financiera (ingreso o gasto).
 *
 * Valida que los campos obligatorios (`amount` y `type`) estén presentes.
 *
 * @async
 * @function createTransaction
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {number|string} req.body.amount - Monto de la transacción.
 * @param {string} req.body.type - Tipo de transacción ('income' o 'expense').
 * @param {string} [req.body.category] - Categoría de la transacción.
 * @param {string} [req.body.date] - Fecha de la transacción.
 * @param {string} [req.body.description] - Descripción de la transacción (fallback a category).
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un JSON con los datos de la transacción creada.
 */
const createTransaction = async (req, res, next) => {
    try {
        const { amount, type, category, date, description } = req.body;
        if (!amount || !type) {
            const err = new Error('Rechazado: Amount y Type son obligatorios'); err.status = 400; throw err;
        }

        const [result] = await db.query(
            `INSERT INTO finance (amount, type, category, date) VALUES (?, ?, ?, ?)`,
            [parseFloat(amount), type, category || description, date ? new Date(date) : new Date()]
        );

        res.status(201).json({ id: result.insertId, amount, type, category, date });
    } catch (err) { next(err); }
};

/**
 * Actualiza los datos de una transacción existente.
 *
 * @async
 * @function updateTransaction
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - Identificador de la transacción.
 * @param {Object} req.body - Cuerpo de la petición con los nuevos datos.
 * @param {number|string} req.body.amount - Monto actualizado.
 * @param {string} req.body.type - Tipo actualizado.
 * @param {string} [req.body.category] - Categoría actualizada.
 * @param {string} [req.body.date] - Fecha actualizada.
 * @param {string} [req.body.description] - Descripción actualizada.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un mensaje de éxito o lanza error si no existe.
 */
const updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, type, category, date, description } = req.body;

        const [result] = await db.query(
            `UPDATE finance SET amount=?, type=?, category=?, date=? WHERE id=?`,
            [parseFloat(amount), type, category || description, date ? new Date(date) : new Date(), id]
        );
        if (result.affectedRows === 0) { const e = new Error('Rechazado: La transacción no existe'); e.status = 404; throw e; }

        res.status(200).json({ message: 'Transacción actualizada' });
    } catch (err) { next(err); }
};

/**
 * Elimina una transacción de forma permanente.
 *
 * @async
 * @function deleteTransaction
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - Identificador de la transacción a eliminar.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un mensaje confirmando la eliminación.
 */
const deleteTransaction = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM finance WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: La transacción no existe'); e.status = 404; throw e; }
        res.status(200).json({ message: 'Transacción eliminada' });
    } catch (err) { next(err); }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
