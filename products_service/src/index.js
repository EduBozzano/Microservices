/**
src/index.js
entrypoint: arranca la aplicacion
Responsabilidad unica: inicializar infraestructura (config,DB) y levantar el servidor
NO contiene logica de negocio, sigue el principio SRP (Single Responsability)
*/

'use strict';

require('dotenv').config(); 

const createApp = require('./app'); 
const db = require('./database'); 
const { logInfo, logError } = require('./utils/logger'); 

//configuramos el puerto con ENV que cargamos, con fallback (en caso de error toma el puerto 3001)
const PORT = Number(process.env.PORT) || 3001; 

async function startServer(){
    try {
        //cada logInfo seria un log de informacion que estariamos guardando
        logInfo('bootstrapping: iniciando la conexion a la base de datos');
        //nos conectamos a la base de datos
        await db.connectToDatabase();

        logInfo('Inicializando la aplicacion Express...');
        const app = createApp(); // creamos la app ya configurada (middlewares, rutas, manejador de errores.)

        //cuando la db este lista arrancamos el servidor
        const server = app.listen(PORT, () => {logInfo('Auth Service escuchando en puerto:'+ PORT)});

        //manejo graceful del shutdown
        const gracefulShutdown = async  (signal) => {
            try {
                logInfo('Señal recibida ${signal}: cerrando servidor...')
                //cerramos el servidor (detiene nuevas conexines, y espera que se completen las que ya estan)
                server.close(() => logInfo('Servidor Cerrado.'));

                //exportamos el db close y lo usamos para cerrar la conexion a la db
                await db.closeDatabaseConnection();
                logInfo('Conexcion a DB cerrada');
                process.exit(0);
            } catch (error) {
                logError('Error durante gracefulShutdown', error);
                process.exit(1);
            }
        };

        //llamamos al shutdown dependiendo de la senal recibida
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', ()=> gracefulShutdown('SIGTERM'));

        //capturamos errores no manejados //reason lo genera automaticamente node
        process.on('unhandledRejection', (reason) => {logError('Unhandled Rejection - motivo:', reason)})
        //unhandled para las promesas

        //uncaught para excepciones no manejadas
        process.on('uncaughtException', (error) => {
            logError('UncaughtException - error critico:', error);
            process.exit(1) //(en produccion se suele reiniciar)
        });

    } catch (error) {
        //si falla el bootstraping logueamos y salimos
        logError('Error inicializando el servicio', error);
        process.exit(1);
    }
}

//inicializamos el proceso de arranque
startServer();