const db = require('../config/db');

const getInvoices = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM facturas ORDER BY id DESC');
        res.status(200).json(rows);
    } catch (err) { next(err); }
};

const createInvoice = async (req, res, next) => {
    try {
        const { proveedor_id, monto, referencia } = req.body;

        if (!proveedor_id || !monto || !referencia) {
            const err = new Error('Rechazado: Proveedor, monto y referencia son obligatorios');
            err.status = 400; throw err;
        }

        const [result] = await db.query(
            `INSERT INTO facturas (proveedor_id, monto, referencia) VALUES (?, ?, ?)`,
            [parseInt(proveedor_id), parseFloat(monto), referencia.trim()]
        );

        res.status(201).json({ id: result.insertId, proveedor_id, monto, referencia });
    } catch (err) { next(err); }
};

const updateInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { proveedor_id, monto, referencia } = req.body;

        if (!proveedor_id || !monto || !referencia) {
            const err = new Error('Rechazado: Proveedor, monto y referencia son obligatorios');
            err.status = 400; throw err;
        }

        const [result] = await db.query(
            `UPDATE facturas SET proveedor_id=?, monto=?, referencia=? WHERE id=?`,
            [parseInt(proveedor_id), parseFloat(monto), referencia.trim(), id]
        );
        if (result.affectedRows === 0) { const e = new Error('Rechazado: La factura no existe'); e.status = 404; throw e; }

        res.status(200).json({ message: 'Factura actualizada por completo' });
    } catch (err) { next(err); }
};

const deleteInvoice = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM facturas WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: La factura no existe'); e.status = 404; throw e; }
        res.status(200).json({ message: 'Factura eliminada por completo' });
    } catch (err) { next(err); }
};

module.exports = { getInvoices, createInvoice, updateInvoice, deleteInvoice };
