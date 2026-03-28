const db = require('../config/db');

/**
 * Recupera todos los clientes ordenados por nombre.
 * @route GET /api/clients
 */
exports.getAllClients = async (req, res, next) => {
    try {
        const [rows] = await db.query("SELECT * FROM clients ORDER BY name ASC");
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error en getAllClients:", err);
        res.status(500).json({ error: "Ocurrió un error al obtener la lista de clientes." });
    }
};

/**
 * Crea un nuevo cliente.
 * @route POST /api/clients
 */
exports.createClient = async (req, res, next) => {
    try {
        let { name, phone, email, notes } = req.body;
        name = name ? name.trim() : null;

        if (!name) {
            return res.status(400).json({ error: "El Nombre del cliente es requerido obligatoriamente." });
        }

        const [result] = await db.query(
            `INSERT INTO clients (name, phone, email, notes) VALUES (?, ?, ?, ?)`,
            [name, phone ? phone.toString().replace(/\s+/g, '') : null, email, notes]
        );
        res.status(201).json({ id: result.insertId, name, phone, email, notes });
    } catch (err) {
        console.error("Error en createClient:", err);
        res.status(500).json({ error: "Ocurrió un error al crear el cliente." });
    }
};

/**
 * Actualiza la información de un cliente existente.
 * @route PUT /api/clients/:id
 */
exports.updateClient = async (req, res, next) => {
    try {
        let { name, phone, email, notes } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: "El Nombre del cliente no puede estar vacío." });
        }

        const [result] = await db.query(
            `UPDATE clients SET name = ?, phone = ?, email = ?, notes = ? WHERE id = ?`,
            [name.trim(), phone ? phone.toString().replace(/\s+/g, '') : null, email, notes, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Rechazado: El Cliente apuntado a modificar no existe." });
        }

        res.status(200).json({ message: "Cliente actualizado exitosamente" });
    } catch (err) {
        console.error("Error en updateClient:", err);
        res.status(500).json({ error: "Ocurrió un error al actualizar el cliente." });
    }
};

/**
 * Elimina un cliente.
 * @route DELETE /api/clients/:id
 */
exports.deleteClient = async (req, res, next) => {
    try {
        const [result] = await db.query(`DELETE FROM clients WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Rechazado: El Cliente apuntado a borrar no existe." });
        }
        res.status(200).json({ message: "Cliente borrado definitivamente" });
    } catch (err) {
        console.error("Error en deleteClient:", err);
        res.status(500).json({ error: "Ocurrió un error al eliminar el cliente." });
    }
};