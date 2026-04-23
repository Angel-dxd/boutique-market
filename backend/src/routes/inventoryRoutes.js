const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProductStock, updateProduct, deleteProduct } = require('../controllers/inventoryController');
const validate = require('../middlewares/validate');
const { productSchema, stockUpdateSchema } = require('../utils/schemas');

router.get('/', getProducts);
router.post('/', validate(productSchema), createProduct);
router.put('/:id/stock', validate(stockUpdateSchema), updateProductStock);
router.put('/:id', validate(productSchema), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
