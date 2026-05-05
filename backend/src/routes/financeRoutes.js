/**
 * routes/financeRoutes.js
 * Rutas para la gestión financiera (ingresos y gastos).
 */
const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/financeController');

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
