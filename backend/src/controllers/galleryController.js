/**
 * controllers/galleryController.js
 * Gestión de la galería de trabajos (portfolio) para la Boutique.
 */
const db = require('../config/db');

/**
 * Obtiene todos los trabajos de la galería ordenados por fecha de creación descendente.
 *
 * @async
 * @function getWorks
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware de errores.
 * @returns {Promise<void>} Retorna un JSON con la lista de trabajos de la galería.
 */
const getWorks = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 12; // Por defecto 12 para carga rápida
        const offset = parseInt(req.query.offset) || 0;
        const clientId = req.query.client_id ? parseInt(req.query.client_id) : null;
        
        let queryStr = 'SELECT * FROM gallery';
        let queryParams = [];
        if (clientId) {
            queryStr += ' WHERE client_id = ?';
            queryParams.push(clientId);
        }
        queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(limit, offset);
        
        const [rows] = await db.query(queryStr, queryParams);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

/**
 * Obtiene un trabajo específico de la galería por su ID.
 *
 * @async
 * @function getWorkById
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - Identificador único del trabajo.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON con los datos del trabajo o lanza error 404 si no existe.
 */
const getWorkById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM gallery WHERE id = ?', [parseInt(id)]);
        if (rows.length === 0) return res.status(404).json({ error: 'Trabajo no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

/**
 * Sube un nuevo trabajo a la galería.
 *
 * @async
 * @function createWork
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.title - Título o nombre del trabajo.
 * @param {string} [req.body.category] - Categoría del trabajo (e.g. acrílico, semipermanente).
 * @param {string} req.body.image - URL o string base64 de la imagen.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON con el mensaje de éxito y el ID insertado.
 */
const createWork = async (req, res, next) => {
    try {
        const { title, category, image, client_id } = req.body;
        if (!title || !image) {
            return res.status(400).json({ error: 'Faltan datos obligatorios (título, imagen)' });
        }
        
        const [result] = await db.query(
            'INSERT INTO gallery (title, category, image, client_id) VALUES (?, ?, ?, ?)',
            [title, category, image, client_id ? parseInt(client_id) : null]
        );
        res.status(201).json({ message: 'Trabajo subido con éxito', id: result.insertId });
    } catch (err) {
        next(err);
    }
};

/**
 * Actualiza los datos de un trabajo existente en la galería.
 *
 * @async
 * @function updateWork
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - Identificador único del trabajo.
 * @param {Object} req.body - Cuerpo de la petición con nuevos datos.
 * @param {string} req.body.title - Nuevo título del trabajo.
 * @param {string} [req.body.category] - Nueva categoría.
 * @param {string} req.body.image - Nueva URL o string de la imagen.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON con el mensaje de éxito o error 404 si no se encontró.
 */
const updateWork = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, category, image, client_id } = req.body;
        
        if (!title || !image) {
            return res.status(400).json({ error: 'Faltan datos obligatorios para actualizar' });
        }

        const [result] = await db.query(
            'UPDATE gallery SET title = ?, category = ?, image = ?, client_id = ? WHERE id = ?',
            [title, category, image, client_id ? parseInt(client_id) : null, parseInt(id)]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Trabajo no encontrado' });
        res.json({ message: 'Trabajo actualizado correctamente' });
    } catch (err) {
        next(err);
    }
};

/**
 * Elimina un trabajo de la galería.
 *
 * @async
 * @function deleteWork
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - Identificador único del trabajo a eliminar.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar el error al middleware.
 * @returns {Promise<void>} Retorna un JSON confirmando la eliminación o error 404 si no existe.
 */
const deleteWork = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM gallery WHERE id = ?', [parseInt(id)]);
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
