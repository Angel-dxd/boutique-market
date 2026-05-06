/**
 * routes/financeRoutes.js
 * Rutas para la gestión financiera (ingresos y gastos).
 */
const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/financeController');

/**
 * @route GET /api/finance
 * @description Obtiene el historial completo de transacciones financieras.
 * @access Private
 * @controller financeController.getTransactions
 */
router.get('/', getTransactions);

/**
 * @route POST /api/finance
 * @description Registra una nueva transacción financiera (ingreso o gasto).
 * @access Private
 * @controller financeController.createTransaction
 */
router.post('/', createTransaction);

/**
 * @route PUT /api/finance/:id
 * @description Actualiza los datos de una transacción existente.
 * @access Private
 * @controller financeController.updateTransaction
 */
router.put('/:id', updateTransaction);

/**
 * @route DELETE /api/finance/:id
 * @description Elimina una transacción de forma permanente.
 * @access Private
 * @controller financeController.deleteTransaction
 */
router.delete('/:id', deleteTransaction);

module.exports = router;
