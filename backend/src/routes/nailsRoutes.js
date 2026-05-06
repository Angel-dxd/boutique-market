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
 *
 * @async
 * @function getNails
 * @param {import('express').Request} req - Petición Express.
 * @param {import('express').Response} res - Respuesta Express.
 * @returns {Promise<void>} JSON con el listado de diseños.
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
 *
 * @async
 * @function createNail
 * @param {import('express').Request} req - Petición Express.
 * @param {import('express').Response} res - Respuesta Express.
 * @returns {Promise<void>} JSON con el resultado de la inserción.
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

/**
 * Elimina un diseño de uñas.
 *
 * @async
 * @function deleteNail
 * @param {import('express').Request} req - Petición Express.
 * @param {import('express').Response} res - Respuesta Express.
 * @returns {Promise<void>} JSON confirmando la eliminación.
 */
const deleteNail = async (req, res) => {
    try {
         await db.query('DELETE FROM nails WHERE id = ?', [req.params.id]);
         res.json({ success: true });
    } catch (e) {
         res.status(500).json({ success: false, error: e.message });
    }
};

/**
 * @route GET /api/nails
 * @description Obtiene el listado de diseños de uñas.
 * @access Private
 */
router.get('/', getNails);

/**
 * @route POST /api/nails
 * @description Crea un nuevo diseño de uñas.
 * @access Private
 */
router.post('/', createNail);

/**
 * @route DELETE /api/nails/:id
 * @description Elimina un diseño de uñas.
 * @access Private
 */
router.delete('/:id', deleteNail);

module.exports = router;
