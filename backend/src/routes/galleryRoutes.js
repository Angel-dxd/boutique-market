/**
 * routes/galleryRoutes.js
 * Rutas para el portfolio/galería de trabajos realizados.
 */
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

// Rutas para la gestión de galería interactiva
router.get('/', galleryController.getWorks);
router.get('/:id', galleryController.getWorkById);
router.post('/', galleryController.createWork);
router.put('/:id', galleryController.updateWork);
router.delete('/:id', galleryController.deleteWork);

module.exports = router;
