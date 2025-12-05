// src/config/database.js
'use strict';

// import { createRequire } from 'node:module';
// const require = createRequire(import.meta.url);

// const { Sequelize } = require('sequelize');
// const { logInfo, logError } = require('../utils/logger');
import Sequelize from 'sequelize';
import { logInfo, logError } from '../utils/logger.js'

import dotenv from 'dotenv';
dotenv.config();

// instanciamos Sequelize (no correr aún)
const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  dialect: 'mysql',
  logging: false, // o una función para loguear queries
});

// Función para conectar a la base de datos
async function connectToDatabase() {
  try {
    logInfo('Conectando a la base de datos MySQL desde Orders Service...');
    await sequelize.authenticate();
    logInfo('Conexión establecida correctamente con MySQL');

    // Sincronizar modelos — IMPORTANTE
    await sequelize.sync({ alter: false });
    logInfo('Modelos sincronizados correctamente');

    return sequelize;
  } catch (error) {
    logError('Error conectando a MySQL', error);
    throw error;
  }
}

// Función para cerrar la conexión
async function closeDatabase() {
  try {
    await sequelize.close();
    logInfo('Conexión a MySQL cerrada correctamente');
  } catch (error) {
    logError('Error cerrando la conexión a MySQL', error);
    throw error;
  }
}

// module.exports = {
//   sequelize,
//   connectToDatabase,
//   closeDatabase
// };
export{
  sequelize,
  connectToDatabase,
  closeDatabase  
}