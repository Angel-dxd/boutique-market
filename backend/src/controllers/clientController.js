// controllers/clientController.js
const db = require('../config/db');

exports.getAllClients = async (req, res, next) => {
    try {
        const [rows] = await db.query("SELECT * FROM clients ORDER BY name ASC");
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        next(err); // delega al error handler global
    }
};

exports.createClient = async (req, res, next) => {
    try {
        const { name, phone, email, notes } = req.body; // ya viene limpio del middleware
        const [result] = await db.query(
            `INSERT INTO clients (name, phone, email, notes) VALUES (?, ?, ?, ?)`,
            [name, phone, email, notes]
        );
        res.status(201).json({ success: true, data: { id: result.insertId, name, phone, email, notes } });
    } catch (err) {
        next(err);
    }
};

exports.updateClient = async (req, res, next) => {
    try {
        const { name, phone, email, notes } = req.body;
        const [result] = await db.query(
            `UPDATE clients SET name = ?, phone = ?, email = ?, notes = ? WHERE id = ?`,
            [name, phone, email, notes, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, errors: ["Cliente no encontrado."] });
        }
        res.status(200).json({ success: true, data: { message: "Cliente actualizado exitosamente." } });
    } catch (err) {
        next(err);
    }
};

exports.deleteClient = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM clients WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, errors: ["Cliente no encontrado."] });
        }
        res.status(200).json({ success: true, data: { message: "Cliente eliminado correctamente." } });
    } catch (err) {
        next(err);
    }
};