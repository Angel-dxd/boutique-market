/**
 * controllers/invoiceController.js
 * Gestión de facturas de proveedores para el módulo de Market.
 */
const db = require('../config/db');

/**
 * Obtiene el listado de todas las facturas de proveedores registradas.
 *
 * @async
 * @function getInvoices
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un JSON con el listado de facturas.
 */
const getInvoices = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM invoices ORDER BY id DESC');
        res.status(200).json(rows);
    } catch (err) { next(err); }
};

/**
 * Registra una nueva factura asociada a un proveedor.
 *
 * Valida la existencia de los campos obligatorios: proveedor, monto y referencia.
 *
 * @async
 * @function createInvoice
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {number|string} req.body.provider_id - ID del proveedor.
 * @param {number|string} req.body.amount - Monto total de la factura.
 * @param {string} req.body.reference - Número o referencia de la factura.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un JSON con los datos de la factura creada.
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

/**
 * Actualiza los datos de una factura existente.
 *
 * @async
 * @function updateInvoice
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - Identificador de la factura.
 * @param {Object} req.body - Cuerpo de la petición con los nuevos datos.
 * @param {number|string} req.body.provider_id - ID del proveedor actualizado.
 * @param {number|string} req.body.amount - Monto actualizado.
 * @param {string} req.body.reference - Referencia actualizada.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un mensaje confirmando la actualización o error 404.
 */
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

/**
 * Elimina una factura del sistema de forma permanente.
 *
 * @async
 * @function deleteInvoice
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - Identificador de la factura a eliminar.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para el manejo de errores.
 * @returns {Promise<void>} Retorna un mensaje confirmando la eliminación o error 404.
 */
const deleteInvoice = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM invoices WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: La factura no existe'); e.status = 404; throw e; }
        res.status(200).json({ message: 'Factura eliminada por completo' });
    } catch (err) { next(err); }
};

module.exports = { getInvoices, createInvoice, updateInvoice, deleteInvoice };
