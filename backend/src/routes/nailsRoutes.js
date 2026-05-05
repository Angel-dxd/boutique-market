/**
 * routes/nailsRoutes.js
 * Rutas para la gestión de la galería de uñas (Mis Uñas).
 * Nota: Este controlador está integrado directamente en el archivo de rutas.
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/nails
/**
 * Obtiene todos los diseños de uñas.
 * @route GET /api/nails
 */
const getNails = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM nails ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// POST /api/nails
/**
 * Registra un nuevo diseño de uñas.
 * @route POST /api/nails
 */
const createNail = async (req, res) => {
    try {
        const { title, imageUrl } = req.body;
        if (!title || !imageUrl) return res.status(400).json({ success: false, error: 'Título y Enlace son obligatorios' });

        const [result] = await db.query(
            'INSERT INTO nails (title, imageUrl) VALUES (?, ?)',
            [title, imageUrl]
        );
        res.status(201).json({ success: true, id: result.insertId, title, imageUrl });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// DELETE /api/nails/:id
const deleteNail = async (req, res) => {
    try {
         await db.query('DELETE FROM nails WHERE id = ?', [req.params.id]);
         res.json({ success: true });
    } catch (e) {
         res.status(500).json({ success: false, error: e.message });
    }
};

router.get('/', getNails);
router.post('/', createNail);
router.delete('/:id', deleteNail);

module.exports = router;
