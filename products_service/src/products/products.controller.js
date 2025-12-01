/**
 * src/products/products.controller.js
 * Controlador: recibe request, valida, y delega al service
 */

'use strict';

const productService = require('products.service');
const { logInfo, logError } = require('./utils/logger');

/*
 * Crear un nuevo producto
 */
async function createProduct(request, respuesta) {
    try {
        const { name, price, description } = request.body;

        //validacion minima
        if (!name || !price) {
            return respuesta.status(400).json( {error: "name y price son obligatorios"});
        }

        const product = await productService.createProduct({
            name,
            price,
            description,
        });

        logInfo("Producto creado", { id: product._id });

        return respuesta.status(201).json(product);

    } catch (error) {
        logError("Error en createProduct controller", error);
        return respuesta.status(500).json({ error: "Error al crear producto"});
    }
}

/**
 * Obtener todos los products
 */
async function getAllProducts(request, respuesta) {
    try {
        const products = await productService.getAllProducts();
        return respuesta.status(200).json(products);    
    } catch (error) {
        logError("Erro en getAllProducts controller", error)
        return respuesta.status(500).json( {error: "Error al obtener productos"} );
    }
}

/**
 * Obtener un producto por ID
 */
async function getProductById(request, respuesta) {
    try {
        const {id} = request.params;

        const product = await productService.getProductById(id);

        if(!product){
            return respuesta.status(404).json({ error: "Producto no encontrado"});
        }

        return respuesta.status(200).json(product);

    } catch (error) {
        logError("Error en getProductById Controller", error);
        return respuesta.status(500).json({ error: "Error al obtener el producto"});
    }
}

/**
 * Actualizar un producto
 */
async function updateProduct(request, respuesta) {
    try {
        const { id } = request.params;
        const updates = request.body;

        const product = await productService.updateProduct(id, updates);

        if(!product){
            return respuesta.status(404).json({ error: "Producto no encontrado"});
        }

        return respuesta.status(200).json(product);
    } catch (error) {
        logError("Error en updateProduct controller", error);
        return respuesta.status(500).json({error: "Error al actualizar producto"});
    }
}

/**
 * Eliminar un producto
 */
async function deleteProduct(request, respuesta) {
    try {
        const {id} = request.params

        const deleted = await productService.deleteProduct(id);

        if(!deleted){
            return respuesta.status(404).json( { error: "Producto no encontrado" } );
        }

        return respuesta.status(200).json({ message: "Producto eliminado correctamente"});
    } catch (error) {
        logError("Error en deleteProduct controller", error);
        return respuesta.status(500).json({ERROR: "Error al eliminar el producto"});
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};