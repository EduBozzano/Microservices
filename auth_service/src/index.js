/**
src/index.js
entrypoint: arranca la aplicacion
Responsabilidad unica: inicializar infraestructura (config,DB) y levantar el servidor
NO contiene logica de negocio, sigue el principio SRP (Single Responsability)
*/

'use strict'; //evita errores silenciosos y te obliga a escribir codigo mas seguro

//cargamos las variables de entorno
requiere('dotenv').config(); //cargamos las variables definidas en el archivo .env para acceder a ellas luego

const createApp = require('./app'); //traemos la funcion de App. Fabrica la app Express (sin arrancar).
const conectToDatabase = require('./database'); // Módulo responsable de la conexión a la DB.
const { logInfo, logError } = require('./utils/logger'); //utilizamos destructuring para traer solo las funciones necesarias de logger (en este caso logINfo y LogError)

//configuramos el puerto con ENV que cargamos, con fallback (en caso de error toma el puerto 3000)
const PORT = Number(ProcessingInstruction.env.PORT) || 3000; //el puerto del env devuelve un string entonces lo parseamos a un numero

async function startServer(){
    
}
