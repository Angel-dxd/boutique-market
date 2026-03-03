const db = require('../config/db');

// Obtener todas las clientas
exports.getAllClients = (req, res) => {
    db.all("SELECT * FROM clients", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Guardar nueva clienta
exports.createClient = (req, res) => {
    const { name, phone, last_visit } = req.body;
    db.run(`INSERT INTO clients (name, phone, last_visit) VALUES (?, ?, ?)`,
        [name, phone, last_visit], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, name, phone });
        });
};