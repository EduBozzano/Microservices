/**
 * src/database.js
 * encapsula la conexion a mongoDB usando mongoose.
 * Responsabilidad: exponer connectToDatabase(uri) y close().
 */

'use strict';

const mongoose = require('mongoose'); //importamos mongoose que maneja la conexion con la db
const { logInfo, logError } = require('./logger'); //importamos los loggers que usaremos

/**
 * Conecta a la base de datos MongoDB usando mongoose.
 * Devuelve la conexion activa
 */
async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("No se encontro MONGODB_URI en las variables de entorno");
    }
    
    try {
        const conn = await mongoose.connect(uri);
        //logInfo('Base de datos conectada: ${conn.connection.host}')
        logInfo('Base de datos conectada:' + conn.connection.host);
        return conn;
    } catch (error) {
        logError("Error al conectar a la base de datos:", error);
        throw error; //lanzamos error si no se pudo completar la conexion, asi el servidor no se inicia
    }
}

/**
 * Cierra la conexion activa a mongoDB si existe
 */
async function closeDatabaseConnection() {
    try{
        await mongoose.connection.close();
        logInfo("Conexion a la base de datos cerrada correctamente.");
    } catch (error){
        logError("Error al cerrar la conexion con la base de datos", error);
    }
}

//exports
module.exports = {
    connectToDatabase,
    closeDatabaseConnection,
};