/**
 * routes/invoiceRoutes.js
 * Rutas para la gestión de facturas de proveedores.
 */
const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');

/**
 * @route GET /api/invoices
 * @description Obtiene todas las facturas registradas.
 * @access Private
 * @controller invoiceController.getInvoices
 */
router.get('/', getInvoices);

/**
 * @route POST /api/invoices/scan
 * @description Escanea una factura usando IA / OCR simulado y devuelve los datos extraídos.
 * @access Private
 * @controller invoiceController.scanInvoice
 */
router.post('/scan', require('../controllers/invoiceController').scanInvoice);

/**
 * @route POST /api/invoices
 * @description Registra una nueva factura de proveedor.
 * @access Private
 * @controller invoiceController.createInvoice
 */
router.post('/', createInvoice);

/**
 * @route PUT /api/invoices/:id
 * @description Actualiza los datos de una factura existente.
 * @access Private
 * @controller invoiceController.updateInvoice
 */
router.put('/:id', updateInvoice);

/**
 * @route DELETE /api/invoices/:id
 * @description Elimina una factura de forma permanente.
 * @access Private
 * @controller invoiceController.deleteInvoice
 */
router.delete('/:id', deleteInvoice);

module.exports = router;
