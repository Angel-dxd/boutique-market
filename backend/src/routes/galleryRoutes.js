/**
 * routes/galleryRoutes.js
 * Rutas para el portfolio/galería de trabajos realizados.
 */
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

// Rutas para la gestión de galería interactiva
/**
 * @route GET /api/gallery
 * @description Obtiene todos los trabajos de la galería.
 * @access Private
 * @controller galleryController.getWorks
 */
router.get('/', galleryController.getWorks);

/**
 * @route GET /api/gallery/:id
 * @description Obtiene un trabajo específico por su ID.
 * @access Private
 * @controller galleryController.getWorkById
 */
router.get('/:id', galleryController.getWorkById);

/**
 * @route POST /api/gallery
 * @description Sube un nuevo trabajo a la galería.
 * @access Private
 * @controller galleryController.createWork
 */
router.post('/', galleryController.createWork);

/**
 * @route PUT /api/gallery/:id
 * @description Actualiza los datos de un trabajo existente.
 * @access Private
 * @controller galleryController.updateWork
 */
router.put('/:id', galleryController.updateWork);

/**
 * @route DELETE /api/gallery/:id
 * @description Elimina un trabajo de la galería.
 * @access Private
 * @controller galleryController.deleteWork
 */
router.delete('/:id', galleryController.deleteWork);

module.exports = router;
