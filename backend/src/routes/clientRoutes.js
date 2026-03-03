const express = require('express');
const router = express.Router();

// GET: Obtener todos los clientes
router.get('/', (req, res) => {
    const db = req.app.get('db');
    db.all("SELECT * FROM clients ORDER BY name ASC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST: Crear un nuevo cliente
router.post('/', (req, res) => {
    const db = req.app.get('db');
    const { name, phone, email, notes } = req.body;

    if (!name) {
        return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const query = `INSERT INTO clients (name, phone, email, notes) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, phone, email, notes], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            id: this.lastID,
            name,
            phone,
            email,
            notes
        });
    });
});

// PUT: Actualizar un cliente existente
router.put('/:id', (req, res) => {
    const db = req.app.get('db');
    const { name, phone, email, notes } = req.body;
    const { id } = req.params;

    const query = `UPDATE clients SET name = ?, phone = ?, email = ?, notes = ? WHERE id = ?`;
    db.run(query, [name, phone, email, notes, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Cliente actualizado", changes: this.changes });
    });
});

// DELETE: Eliminar un cliente
router.delete('/:id', (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;

    db.run(`DELETE FROM clients WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Cliente eliminado correctamente", changes: this.changes });
    });
});

module.exports = router;