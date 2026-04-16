const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { validateClientBody, validateClientId } = require('../middlewares/validateClient');

router.get('/', clientController.getAllClients);
router.post('/', validateClientBody, clientController.createClient);
router.put('/:id', validateClientId, validateClientBody, clientController.updateClient);
router.delete('/:id', validateClientId, clientController.deleteClient);

module.exports = router;