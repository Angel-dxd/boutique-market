/**
 * routes/profileRoutes.js
 * Rutas para la gestión del perfil personal del usuario.
 */
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');

/**
 * @route GET /api/profile
 * @description Obtiene los datos personales del usuario autenticado.
 * @access Private
 */
router.get('/', getProfile);

/**
 * @route PUT /api/profile
 * @description Actualiza los datos personales del usuario.
 * @access Private
 */
router.put('/', updateProfile);

module.exports = router;
