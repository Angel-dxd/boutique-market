const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProductStock, updateProduct, deleteProduct } = require('../controllers/inventoryController');

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id/stock', updateProductStock);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
