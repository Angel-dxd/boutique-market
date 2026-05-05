/**
 * routes/clientRoutes.js
 * Rutas para la gestión de clientas (Boutique).
 */
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { validateClientBody, validateClientId } = require('../middlewares/validateClient');

// Operaciones CRUD base
router.get('/', clientController.getAllClients);                                     // Listado total
router.post('/', validateClientBody, clientController.createClient);                 // Alta
router.put('/:id', validateClientId, validateClientBody, clientController.updateClient); // Modificación
router.delete('/:id', validateClientId, clientController.deleteClient);              // Baja (Soft Delete)

// Fidelización
router.get('/at-risk', clientController.getAtRiskClients);                // GET /api/clients/at-risk?days=30
router.patch('/:id/last-visit', validateClientId, clientController.updateLastVisit); // PATCH /api/clients/:id/last-visit

module.exports = router;