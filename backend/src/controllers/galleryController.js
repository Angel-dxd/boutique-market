/**
 * controllers/galleryController.js
 * Gestión de la galería de trabajos (portfolio) para la Boutique.
 */
const db = require('../config/db');

/**
 * Obtiene todos los trabajos de la galería.
 * @route GET /api/gallery
 */
const getWorks = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM gallery ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

/**
 * Obtiene un trabajo específico por su ID.
 * @route GET /api/gallery/:id
 */
const getWorkById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM gallery WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Trabajo no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

/**
 * Sube un nuevo trabajo a la galería.
 * @route POST /api/gallery
 */
const createWork = async (req, res, next) => {
    try {
        const { title, category, image } = req.body;
        if (!title || !image) {
            return res.status(400).json({ error: 'Faltan datos obligatorios (título, imagen)' });
        }
        
        const [result] = await db.query(
            'INSERT INTO gallery (title, category, image) VALUES (?, ?, ?)',
            [title, category, image]
        );
        res.status(201).json({ message: 'Trabajo subido con éxito', id: result.insertId });
    } catch (err) {
        next(err);
    }
};

// PUT update work
const updateWork = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, category, image } = req.body;
        
        if (!title || !image) {
            return res.status(400).json({ error: 'Faltan datos obligatorios para actualizar' });
        }

        const [result] = await db.query(
            'UPDATE gallery SET title = ?, category = ?, image = ? WHERE id = ?',
            [title, category, image, id]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Trabajo no encontrado' });
        res.json({ message: 'Trabajo actualizado correctamente' });
    } catch (err) {
        next(err);
    }
};

// DELETE work
const deleteWork = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM gallery WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Trabajo no encontrado' });
        res.json({ message: 'Trabajo eliminado correctamente' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getWorks,
    getWorkById,
    createWork,
    updateWork,
    deleteWork
};
