/**
 * controllers/providerController.js
 * Gestión de proveedores para el módulo de Market.
 */
const db = require('../config/db');

/**
 * Obtiene el listado de todos los proveedores activos.
 * @route GET /api/providers
 */
const getProviders = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM providers ORDER BY name ASC');
        res.status(200).json(rows);
    } catch (err) { next(err); }
};

/**
 * Crea un nuevo proveedor.
 * @route POST /api/providers
 */
const createProvider = async (req, res, next) => {
    try {
        let { name, phone, company, category } = req.body;
        name = name ? name.trim() : null;

        if (!name) { const err = new Error("Name es un campo obligatorio"); err.status = 400; throw err; }

        const [result] = await db.query(
            `INSERT INTO providers (name, phone, company, category) VALUES (?, ?, ?, ?)`,
            [name, phone ? phone.toString().replace(/\\s+/g, '') : null, company ? company.trim() : null, category || 'Suministros']
        );
        res.status(201).json({ id: result.insertId, name, phone, company });
    } catch (err) { next(err); }
};

const bulkCreateProviders = async (req, res, next) => {
    try {
        const { providers } = req.body;
        if (!Array.isArray(providers) || providers.length === 0) {
            const err = new Error("El arreglo de proveedores CSV es inválido, vacío o corrupto"); err.status = 400; throw err;
        }

        const validProviders = providers.map(p => ({
            name: p.name ? String(p.name).trim() : null,
            phone: p.phone ? String(p.phone).replace(/[^0-9+\\s-]/g, '').trim() : null,
            company: p.company ? String(p.company).trim() : null,
            category: p.category ? String(p.category).trim() : 'General'
        })).filter(p => p.name !== null && p.name !== '');

        if (validProviders.length === 0) { const e = new Error("El CSV no contiene elementos válidos con la estructura apropiada (falta name)"); e.status = 400; throw e; }

        const values = validProviders.map(p => [p.name, p.phone, p.company, p.category]);
        const [result] = await db.query(`INSERT INTO providers (name, phone, company, category) VALUES ?`, [values]);

        res.status(201).json({ message: 'Lote importado con éxito a MySQL Central', count: result.affectedRows });
    } catch (err) { next(err); }
};

const deleteProvider = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM providers WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) { const e = new Error('Rechazado: El proveedor de origen no existe'); e.status = 404; throw e; }
        res.status(200).json({ message: 'Proveedor purgado del sistema' });
    } catch (err) { next(err); }
};

module.exports = { getProviders, createProvider, bulkCreateProviders, deleteProvider };
