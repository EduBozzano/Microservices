
/**
 * utils/logger.js
 * Logger minimalista y reemplazable
 * 
 * Diseno:
 * -Nombres descriptivos: logInfo, logWarn, logError, logDebug.
 * -Un solo proposito por funcion (SRP).
 * -Facil de reemplazar (Dependency Inversion): otros modulos requieren estas funciones
 * -Nivel de log configurable por ENV.
 *  */

'use strict';

// Niveles de log en orden de severidad, mas bajo = mas detalles
const LEVELS =  { debug: 10, info: 20, warn: 30, error: 40 };

//definimos el nivel minimo para loguear (por defecto en produccion es info y debug en desarrollo)
const DEFAULT_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info');// si se asigna una const LOG_LEVEL la utiliza, si no, se basa en el entorno env. para elegir el nivel
const currentLevelValue = LEVELS[DEFAULT_LEVEL] ?? LEVELS.info; //si por alguna razon el nivel es undefined, utilizamos info como fallback
// el operador ?? significa, si la parte izquierda es null o undefined, usa la derecha

//formateamos el timestamp en ISO
function getTimestampIso(){
    return new Date().toISOString();
}

/**
 * buildLogEntry 
 * construimos un objeto log con sus propiedades
 * 
 * @param {string} level - nivel textual {'info','error',...}
 * @param {string} message - mensaje principal
 * @param {object} meta - objeto con datos opcionales que se pueden agregar al log
 * @returns {object} - objeto log devuelto
*/

function buildLogEntry(level, message, meta ={}){
    return {
        timestamp: getTimestampIso(),
        level,
        message,
        ...meta,
    };
}

/**
 * shouldLog
 * Decide si el mensaje se imprime o no en base al nivel configurado
 */
function shouldLog(level){
    const value = LEVELS[level] ?? LEVELS.info;
    return value >= currentLevelValue;
}

/**
 *  output: funcion que envia el log a stdout/stderr (se escribe internamente en esas salidas)
 *  se puede cambiar la salida si se quiere (http) sin tocar el resto del codigo
 */
function output(logEntry){
    //para errores usamos stderr
    const isError = logEntry.level === 'error';
    const line = JSON.stringify(logEntry); //lo pasamos a Json
    if (isError) {
        console.error(line);
    }else{
        console.log(line);
    }
}

//Empezamos con los loggins

/**
 *  logDebug - uso para desarrollo
 * @param {string} message
 * @param {object} meta
 */
function logDebug(message, meta = {}){
    if (!shouldLog('debug')) return;
    const entry = buildLogEntry('debug', message, meta);
    output(entry);
}

/**
 * logInfo - logs de informacion general (startup, health, succes)
 */
function logInfo(message, meta = {}){
    if (!shouldLog('info')) return;
    const entry = buildLogEntry('info', message, meta);
    output(entry);
}

/**
 * logWarn - logs de advertencias sin romper el proceso
 */
function logWarn(message, meta = {}){
    if (!shouldLog('warn')) return;
    const entry = buildLogEntry('warn', message, meta)
    output(entry);
}

/**
 * logError - errores graves
 */
function logError(message, meta = {}){
    //si meta es un error, convertimos correctamente
    if (meta instanceof Error){
        meta = {
            error_message: meta.message,
            //error_stack: meta.stack //si queremos mas informacion podemos imprimir el stack
        };
    }
    //siempre se intenta loguear los errores, ignorando el LEVEL si es necesario.
    const entry = buildLogEntry('error', message, meta);
    output(entry);
}

/**
 * Exports: API pequeña para que el resto del codigo la use
 */
module.exports = {
    logDebug,
    logInfo,
    logWarn,
    logError,
    // se exporta para testing y por si otros modulos necesitan inspeccionar
    _internarls:{
        buildLogEntry,
        getTimestampIso,
        LEVELS,
        currentLevelValue,
    }
}; 