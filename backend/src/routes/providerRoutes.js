/**
 * routes/providerRoutes.js
 * Rutas para la gestión de proveedores (Market).
 */
const express = require('express');
const router = express.Router();
const { getProviders, createProvider, bulkCreateProviders, deleteProvider } = require('../controllers/providerController');

/**
 * @route GET /api/providers
 * @description Obtiene el listado de proveedores.
 * @access Private
 * @controller providerController.getProviders
 */
router.get('/', getProviders);

/**
 * @route POST /api/providers
 * @description Crea un nuevo proveedor.
 * @access Private
 * @controller providerController.createProvider
 */
router.post('/', createProvider);

/**
 * @route POST /api/providers/bulk
 * @description Importación masiva de proveedores (vía CSV).
 * @access Private
 * @controller providerController.bulkCreateProviders
 */
router.post('/bulk', bulkCreateProviders);

/**
 * @route DELETE /api/providers/:id
 * @description Elimina un proveedor.
 * @access Private
 * @controller providerController.deleteProvider
 */
router.delete('/:id', deleteProvider);

module.exports = router;
