const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { validateClientBody, validateClientId } = require('../middlewares/validateClient');

// CRUD base
router.get('/', clientController.getAllClients);
router.post('/', validateClientBody, clientController.createClient);
router.put('/:id', validateClientId, validateClientBody, clientController.updateClient);
router.delete('/:id', validateClientId, clientController.deleteClient);

// Fidelización
router.get('/at-risk', clientController.getAtRiskClients);                // GET /api/clients/at-risk?days=30
router.patch('/:id/last-visit', validateClientId, clientController.updateLastVisit); // PATCH /api/clients/:id/last-visit

module.exports = router;