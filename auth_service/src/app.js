/**
 * src/app.js
 * construye y devuelve la instancia de Express.
 * Responsabilidad: montar middlewares, rutas y manejar errores globales
 */

'use strict';

//importamos los modulos necesarios
const express = require('express');
const morgan = require('morgan'); //morgan es un logger para las request, registra todas las peticiones que entran al servidor
const helmet = require('helmet'); //seguridad basica
const authRouters = require('auth.routes'); //las rutas del dominio auth

//creamos una funcion para crear la App con sus configuraciones
function createApp(){
    const app = express();

    //configuramos los middlewares
    //seguridad HTTP headers (utiliza encabezados de seguridad para las respuestas, haciendolas mas seguras y protegiendola de vulnerabilidades)
    app.use(hetmet());

    //Parseamos el JSON entrante y limitamos el tamano por seguridad 
    app.use(express.json({ limit: '10kb'}));

    // logging de las request con morgan, en formato dev
    app.use(morgan('dev'));

    //ruta get para health, es para un chequeo si el sevidor esta "vivo" solo es informativo
    app.get('/health', (request, response) => response.status(200).json({ ok: true}));

    //montamos las rutas del dominio, basicamente los endpoints finales 
    app.use('/api/auth', authRouters); // los endspoints serian /api/auth/la-direccion-de-authRouters

    // Middleware para rutas no encontradas //por mas de que no se use next en el middleware se suele dejar por convencion y para mantener la firma, Express solo reconoce que es un middleware segun la cantidad de parametros (3 middleware normal y 4 de error )
    app.use((request, response, next) => {response.status(404).json({ error: 'Not Found', path: request.originalUrl})}); //originalUrl es la urgl que el usuario solicito

    //manejador global de errores (ultimo middleware)
    //centraliza las respuesta de errores para un mejor manejo 
    app.use((error, request, response, next) => { 
        //si el error tiene un status lo usamos, si no, usamos 500
        const status = error.status || 500;
        const message = status >= 500 ? 'Internal Server Error' : (error.message || 'Error');

        const payload = {error: message} //guardamos el mensaje
        // se podria mandar un stack en desarrollo (una pila con informacion del problema) con stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        
        //enviamos la respuesta de error al cliente
        response.status(status).json(payload);
    })

    return app

}

module.exports = createApp; 