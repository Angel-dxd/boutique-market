const db = require('../config/db');

const getTransactions = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM finanzas ORDER BY fecha DESC');
        // Map to standard frontend shape
        const transactions = rows.map(r => ({
            id: r.id,
            amount: r.monto,
            type: r.tipo,
            category: r.categoria,
            date: r.fecha
        }));
        res.status(200).json(transactions);
    } catch (err) { next(err); }
};

const createTransaction = async (req, res, next) => {
    try {
        const { amount, type, category, date, description } = req.body;
        if (!amount || !type) {
            const err = new Error('Rechazado: Monto y Tipo son obligatorios'); err.status = 400; throw err;
        }

        const [result] = await db.query(
            `INSERT INTO finanzas (monto, tipo, categoria, fecha) VALUES (?, ?, ?, ?)`,
            [parseFloat(amount), type, category || description, date ? new Date(date) : new Date()]
        );

        res.status(201).json({ id: result.insertId, amount, type, category, date });
    } catch (err) { next(err); }
};

const updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, type, category, date, description } = req.body;

        const [result] = await db.query(
            `UPDATE finanzas SET monto=?, tipo=?, categoria=?, fecha=? WHERE id=?`,
            [parseFloat(amount), type, category || description, date ? new Date(date) : new Date(), id]
        );
        if (result.affectedRows === 0) { const e = new Error('Rechazado: La transacción no existe'); e.status = 404; throw e; }

        res.status(200).json({ message: 'Transacción actualizada' });
    } catch (err) { next(err); }
};

const deleteTransaction = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM finanzas WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: La transacción no existe'); e.status = 404; throw e; }
        res.status(200).json({ message: 'Transacción eliminada' });
    } catch (err) { next(err); }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
