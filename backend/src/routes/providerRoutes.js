const express = require('express');
const router = express.Router();
const { getProviders, createProvider, bulkCreateProviders, deleteProvider } = require('../controllers/providerController');

router.get('/', getProviders);
router.post('/', createProvider);
router.post('/bulk', bulkCreateProviders);
router.delete('/:id', deleteProvider);

module.exports = router;
