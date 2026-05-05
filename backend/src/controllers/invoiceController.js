/**
 * controllers/invoiceController.js
 * Gestión de facturas de proveedores para el módulo de Market.
 */
const db = require('../config/db');

/**
 * Obtiene el listado de todas las facturas registradas.
 * @route GET /api/invoices
 */
const getInvoices = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM invoices ORDER BY id DESC');
        res.status(200).json(rows);
    } catch (err) { next(err); }
};

/**
 * Registra una nueva factura de proveedor.
 * @route POST /api/invoices
 */
const createInvoice = async (req, res, next) => {
    try {
        const { provider_id, amount, reference } = req.body;

        if (!provider_id || !amount || !reference) {
            const err = new Error('Rechazado: Proveedor, monto y referencia son obligatorios');
            err.status = 400; throw err;
        }

        const [result] = await db.query(
            `INSERT INTO invoices (provider_id, amount, reference) VALUES (?, ?, ?)`,
            [parseInt(provider_id), parseFloat(amount), reference.trim()]
        );

        res.status(201).json({ id: result.insertId, provider_id, amount, reference });
    } catch (err) { next(err); }
};

const updateInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { provider_id, amount, reference } = req.body;

        if (!provider_id || !amount || !reference) {
            const err = new Error('Rechazado: Proveedor, monto y referencia son obligatorios');
            err.status = 400; throw err;
        }

        const [result] = await db.query(
            `UPDATE invoices SET provider_id=?, amount=?, reference=? WHERE id=?`,
            [parseInt(provider_id), parseFloat(amount), reference.trim(), id]
        );
        if (result.affectedRows === 0) { const e = new Error('Rechazado: La factura no existe'); e.status = 404; throw e; }

        res.status(200).json({ message: 'Factura actualizada por completo' });
    } catch (err) { next(err); }
};

const deleteInvoice = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM invoices WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: La factura no existe'); e.status = 404; throw e; }
        res.status(200).json({ message: 'Factura eliminada por completo' });
    } catch (err) { next(err); }
};

module.exports = { getInvoices, createInvoice, updateInvoice, deleteInvoice };
