// controllers/clientController.js
const db = require('../config/db');

exports.getAllClients = async (req, res, next) => {
    try {
        const [rows] = await db.query("SELECT * FROM clients ORDER BY name ASC");
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
};

exports.createClient = async (req, res, next) => {
    try {
        const { name, phone, email, notes, force } = req.body; // ya viene limpio del middleware

        // Check for duplicates (phone or email)
        if (!force && (phone || email)) {
            const conditions = [];
            const values = [];
            if (phone) { conditions.push('phone = ?'); values.push(phone); }
            if (email) { conditions.push('email = ?'); values.push(email); }
            
            const [existing] = await db.query(
                `SELECT id, name FROM clients WHERE ${conditions.join(' OR ')} LIMIT 1`,
                values
            );
            
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    errors: [`Ya existe otro cliente (${existing[0].name}) con este mismo teléfono o email.`]
                });
            }
        }

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
        const { name, phone, email, notes, force } = req.body;
        const clientId = req.params.id;

        // Check for duplicates (phone or email) excluding current client
        if (!force && (phone || email)) {
            const conditions = [];
            const values = [];
            if (phone) { conditions.push('phone = ?'); values.push(phone); }
            if (email) { conditions.push('email = ?'); values.push(email); }
            
            // Add clientId to values array
            values.push(clientId);
            
            const [existing] = await db.query(
                `SELECT id, name FROM clients WHERE (${conditions.join(' OR ')}) AND id != ? LIMIT 1`,
                values
            );
            
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    errors: [`Ya existe otro cliente (${existing[0].name}) con este mismo teléfono o email.`]
                });
            }
        }

        const [result] = await db.query(
            `UPDATE clients SET name = ?, phone = ?, email = ?, notes = ? WHERE id = ?`,
            [name, phone, email, notes, clientId]
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

/**
 * GET /api/clients/at-risk
 * Devuelve clientas que llevan más de N días sin visita.
 * Query param: ?days=30 (por defecto 30)
 *
 * Útil para el módulo de fidelización de la boutique:
 * permite identificar clientas inactivas y actuar antes de perderlas.
 */
exports.getAtRiskClients = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;

        const [rows] = await db.query(
            `SELECT
                id,
                name,
                phone,
                email,
                last_visit,
                DATEDIFF(CURDATE(), last_visit) AS days_since_visit
             FROM clients
             WHERE last_visit IS NOT NULL
               AND DATEDIFF(CURDATE(), last_visit) >= ?
             ORDER BY days_since_visit DESC`,
            [days]
        );

        res.status(200).json({ success: true, data: rows, threshold_days: days });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/clients/:id/last-visit
 * Actualiza la fecha de última visita de una clienta.
 * Se llama automáticamente al crear una cita en el calendario.
 */
exports.updateLastVisit = async (req, res, next) => {
    try {
        const { date } = req.body;
        const visitDate = date ? new Date(date) : new Date();

        const [result] = await db.query(
            `UPDATE clients SET last_visit = ? WHERE id = ?`,
            [visitDate, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, errors: ["Cliente no encontrada."] });
        }

        res.status(200).json({ success: true, data: { message: "Última visita actualizada." } });
    } catch (err) {
        next(err);
    }
};