const db = require('../config/db');

const getProviders = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM providers ORDER BY nombre ASC');
        res.status(200).json(rows);
    } catch (err) { next(err); }
};

const createProvider = async (req, res, next) => {
    try {
        let { nombre, telefono, empresa, categoria } = req.body;
        nombre = nombre ? nombre.trim() : null;

        if (!nombre) { const err = new Error("Nombre es un campo obligatorio"); err.status = 400; throw err; }

        const [result] = await db.query(
            `INSERT INTO providers (nombre, telefono, empresa, categoria) VALUES (?, ?, ?, ?)`,
            [nombre, telefono ? telefono.toString().replace(/\s+/g, '') : null, empresa ? empresa.trim() : null, categoria || 'Suministros']
        );
        res.status(201).json({ id: result.insertId, nombre, telefono, empresa });
    } catch (err) { next(err); }
};

const bulkCreateProviders = async (req, res, next) => {
    try {
        const { providers } = req.body;
        if (!Array.isArray(providers) || providers.length === 0) {
            const err = new Error("El arreglo de proveedores CSV es inválido, vacío o corrupto"); err.status = 400; throw err;
        }

        const validProviders = providers.map(p => ({
            nombre: p.nombre ? String(p.nombre).trim() : null,
            telefono: p.telefono ? String(p.telefono).replace(/[^0-9+\s-]/g, '').trim() : null,
            empresa: p.empresa ? String(p.empresa).trim() : null,
            categoria: p.categoria ? String(p.categoria).trim() : 'General'
        })).filter(p => p.nombre !== null && p.nombre !== '');

        if (validProviders.length === 0) { const e = new Error("El CSV no contiene elementos válidos con la estructura apropiada (falta nombre)"); e.status = 400; throw e; }

        const values = validProviders.map(p => [p.nombre, p.telefono, p.empresa, p.categoria]);
        const [result] = await db.query(`INSERT INTO providers (nombre, telefono, empresa, categoria) VALUES ?`, [values]);

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
