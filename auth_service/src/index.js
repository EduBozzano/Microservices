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
    try {
        //cada logInfo seria un log de informacion que estariamos guardando
        logInfo('bootstrapping: iniciando la conexion a la base de datos');
        //nos conectamos a la base de datos
        await connectToDatabase(Process.env.MONGO_URI);

        logInfo('Inicializando la aplicacion Express...');
        const app = createApp(); // creamos la app ya configurada (middlewares, rutas, manejador de errores.)

        //cuando la db este lista arrancamos el servidor
        const server = app.listen(PORT, () => {logInfo('Auth Service escuchando en puerto ${PORT}')});

        //manejo graceful del shutdown
        const gracefulShutdown = async  (signal) => {
            try {
                logInfo('Señal recibida ${signal}: cerrando servidor...')
                //cerramos el servidor (detiene nuevas conexines, y espera que se completen las que ya estan)
                server.close(() => logInfo('Servidor Cerrado.'));

                //exportamos el db close y lo usamos para cerrar la conexion a la db
                await requiere('./database').close();
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
