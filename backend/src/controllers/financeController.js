/**
 * controllers/financeController.js
 * Gestión de finanzas y transacciones (ingresos y gastos).
 */
const db = require('../config/db');

/**
 * Obtiene el historial completo de transacciones.
 * @route GET /api/finance
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
 * Registra una nueva transacción financiera.
 * @route POST /api/finance
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
 * @route PUT /api/finance/:id
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
 * @route DELETE /api/finance/:id
 */
const deleteTransaction = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM finance WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: La transacción no existe'); e.status = 404; throw e; }
        res.status(200).json({ message: 'Transacción eliminada' });
    } catch (err) { next(err); }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
