const db = require('../config/db');

exports.getAllClients = async (req, res, next) => {
    try {
        const [rows] = await db.query("SELECT * FROM clients ORDER BY name ASC");
        res.status(200).json(rows);
    } catch (err) { next(err); }
};

exports.createClient = async (req, res, next) => {
    try {
        let { name, phone, email, notes } = req.body;
        name = name ? name.trim() : null;

        if (!name) { const err = new Error("El Nombre del cliente es requerido obligatoriamente"); err.status = 400; throw err; }

        const [result] = await db.query(
            `INSERT INTO clients (name, phone, email, notes) VALUES (?, ?, ?, ?)`,
            [name, phone ? phone.toString().replace(/\s+/g, '') : null, email, notes]
        );
        res.status(201).json({ id: result.insertId, name });
    } catch (err) { next(err); }
};

exports.updateClient = async (req, res, next) => {
    try {
        let { name, phone, email, notes } = req.body;
        if (!name || name.trim() === '') { const err = new Error("El Nombre del cliente modificado es inválido"); err.status = 400; throw err; }

        const [result] = await db.query(`UPDATE clients SET name = ?, phone = ?, email = ?, notes = ? WHERE id = ?`, [name, phone, email, notes, req.params.id]);
        if (result.affectedRows === 0) { const e = new Error("Rechazado: El Cliente apuntado a modificar no existe"); e.status = 404; throw e; }

        res.status(200).json({ message: "Cliente actualizado exitosamente" });
    } catch (err) { next(err); }
};

exports.deleteClient = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM clients WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) { const e = new Error("Rechazado: El Cliente apuntado a borrar no existe"); e.status = 404; throw e; }
        res.status(200).json({ message: "Cliente borrado definitivamente" });
    } catch (err) { next(err); }
};