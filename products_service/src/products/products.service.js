/**
 * src/products/products.service.js
 * maneja la logica y usa el modelo para acceder a MongoDB
 */

'use strict';

const Product = require('./products.model');
const { logInfo, logError } = require('../utils/logger');

//Crea un producto
async function createProduct(data) {
    try {
        //creamos un producto con el molde, sin guardarlo todavia
        const product = new Product(data);

        //lo guardamos en la db y obtenemos la version final (con datos como id, etc)
        const saved = await product.save();

        logInfo('Producto creado', { id:saved._id });
        return saved;

    } catch (error) {
        logError('Error al crear producto', {error: error.message});
        throw error;
    }
}

//Obtenemos todos los productos
async function getAllProducts() {
    try {
        return await Product.find({});
    } catch (error) {
        logError('Error al obtener productos', { error: error.message });
        throw error;
    }
}

//obtenemos un producto por ID
async function getProductById(id) {
    try {
        return await Product.findById(id);
    } catch (error) {
        logError('Error al buscar producto por ID', {id, error: error.message });
        throw error;
    }
}

//actualizar un producto por ID
async function updateProduct(id, data) {
    try {
        const updated = await Product.findByIdAndUpdate(id, data,{
            new: true, //devuelve el producto actualizado
            runValidators: true, //valida datos antes de actualizar
        });
        return updated;

    } catch (error) {
        logError('Error al actualizar el producto', { id, error: error.message });
        throw error;
    }
}

//eliminar un producto por ID
async function deleteProduct(id) {
    try{
        const deleted = await Product.findByIdAndDelete(id);
        return deleted;
    } catch (error){
        logError('Error al eliminar el producto', { id, error: error.message });
        throw error;
    }
}

//exportamos los modulos
module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};