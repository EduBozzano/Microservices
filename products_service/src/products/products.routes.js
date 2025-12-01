/**
 * src/products/products.routes
 * Define las rutas del Products Service
 * Conecta las rutas HTTP con el controller
 */

'use strict';

const express = require('express');
const router = express.Router();

const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('./products.controller');

// Rutas REST
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
