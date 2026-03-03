const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');

router.get('/', getInvoices);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;
