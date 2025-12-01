/**
 * src/app
 * Fabrica y configura la aplicacion Express del Products Service
 * No arranca el servidor, solo devuelve la app ya lista
 */

'use strict';

const express = require('express');
const cors = require('cors');

const productsRoutes = require('./products/products.routes')
const { logInfo, logError } = require('./utils/logger');

function createApp(){
    const app = express();

    //middlewares globales
    app.use(cors());
    app.use(express.json());

    //Rutas del microservicio
    app.use('/products', productsRoutes);

    //health check basico
    app.get('health', (request, respuesta) =>{
        respuesta.json({ status: 'ok', service: 'products-service' });
    });

    //manejo de rutas inexistentes
    app.use((request, respuesta) => {
        logInfo('Ruta no encontrada', { path: request.originalUrl });
        respuesta.status(404).json({ error: 'Ruta no encontrada' });
    });

    //manejo global de errores
    app.use((error, request, respuesta, next) => {
        logError('Error inesperado en Products Service', { error: error.message });
        respuesta.status(500).json({ error: 'Error interno del servidor'});
    });

    return app;
}

module.exports = createApp;
