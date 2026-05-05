/**
 * routes/inventoryRoutes.js
 * Rutas para la gestión de productos e inventario (Market).
 */
const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProductStock, updateProduct, deleteProduct } = require('../controllers/inventoryController');
const validate = require('../middlewares/validate');
const { productSchema, stockUpdateSchema } = require('../utils/schemas');

// Operaciones sobre productos
router.get('/', getProducts);                                  // Listar productos
router.post('/', validate(productSchema), createProduct);      // Crear producto
router.put('/:id/stock', validate(stockUpdateSchema), updateProductStock); // Actualizar solo stock
router.put('/:id', validate(productSchema), updateProduct);    // Actualizar producto completo
router.delete('/:id', deleteProduct);                         // Eliminar producto

module.exports = router;
