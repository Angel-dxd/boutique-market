/**
 * routes/clientRoutes.js
 * Rutas para la gestión de clientas (Boutique).
 */
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { validateClientBody, validateClientId } = require('../middlewares/validateClient');

/**
 * @route GET /api/clients
 * @description Obtiene el listado total de clientas activas.
 * @access Private
 * @controller clientController.getAllClients
 */
router.get('/', clientController.getAllClients);

/**
 * @route POST /api/clients
 * @description Crea una nueva clienta.
 * @access Private
 * @middleware validateClientBody - Valida la información del cliente.
 * @controller clientController.createClient
 */
router.post('/', validateClientBody, clientController.createClient);

/**
 * @route PUT /api/clients/:id
 * @description Modifica los datos de una clienta existente.
 * @access Private
 * @middleware validateClientId - Valida que el ID tenga un formato correcto.
 * @middleware validateClientBody - Valida la información del cliente.
 * @controller clientController.updateClient
 */
router.put('/:id', validateClientId, validateClientBody, clientController.updateClient);

/**
 * @route DELETE /api/clients/:id
 * @description Elimina lógicamente (Soft Delete) a una clienta.
 * @access Private
 * @middleware validateClientId - Valida que el ID tenga un formato correcto.
 * @controller clientController.deleteClient
 */
router.delete('/:id', validateClientId, clientController.deleteClient);

// ==========================================
// Módulo de Fidelización
// ==========================================

/**
 * @route GET /api/clients/at-risk
 * @description Devuelve clientas que llevan más de N días sin visita.
 * @access Private
 * @controller clientController.getAtRiskClients
 */
router.get('/at-risk', clientController.getAtRiskClients);

/**
 * @route PATCH /api/clients/:id/last-visit
 * @description Actualiza la fecha de la última visita de una clienta (llamado tras concretar una cita).
 * @access Private
 * @middleware validateClientId - Valida que el ID tenga un formato correcto.
 * @controller clientController.updateLastVisit
 */
router.patch('/:id/last-visit', validateClientId, clientController.updateLastVisit);

module.exports = router;