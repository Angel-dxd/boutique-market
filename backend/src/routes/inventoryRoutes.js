/**
 * routes/inventoryRoutes.js
 * Rutas para la gestión de productos e inventario (Market).
 */
const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProductStock, updateProduct, deleteProduct, getCaducityAlerts } = require('../controllers/inventoryController');
const validate = require('../middlewares/validate');
const { productSchema, stockUpdateSchema } = require('../utils/schemas');

/**
 * @route GET /api/products/alerts
 * @description Listado de productos próximos a vencer.
 * @access Private
 * @controller inventoryController.getCaducityAlerts
 */
router.get('/alerts', getCaducityAlerts);

/**
 * @route GET /api/products
 * @description Listado de productos (con paginación).
 * @access Private
 * @controller inventoryController.getProducts
 */
router.get('/', getProducts);

/**
 * @route POST /api/products
 * @description Crea un nuevo producto.
 * @access Private
 * @middleware validate(productSchema) - Valida los datos del producto.
 * @controller inventoryController.createProduct
 */
router.post('/', validate(productSchema), createProduct);

/**
 * @route PUT /api/products/:id/stock
 * @description Actualiza únicamente el stock de un producto.
 * @access Private
 * @middleware validate(stockUpdateSchema) - Valida que el stock sea un número.
 * @controller inventoryController.updateProductStock
 */
router.put('/:id/stock', validate(stockUpdateSchema), updateProductStock);

/**
 * @route PUT /api/products/:id
 * @description Actualiza un producto completo.
 * @access Private
 * @middleware validate(productSchema) - Valida los datos del producto.
 * @controller inventoryController.updateProduct
 */
router.put('/:id', validate(productSchema), updateProduct);

/**
 * @route DELETE /api/products/:id
 * @description Elimina un producto.
 * @access Private
 * @controller inventoryController.deleteProduct
 */
router.delete('/:id', deleteProduct);

module.exports = router;
