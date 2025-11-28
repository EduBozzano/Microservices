/**
 * src/auth.middleware.js
 * Middleware para proteger rutas usando JWT
 * valida access token antes de permitir acceso a rutas protegidas.
 */

const jwt = require('jsonwebtoken');
const { logError } = require('./logger');

async function authMiddleware(request, respuesta, next) {
    try {
        //leer token del header
        const authHeader = request.headers['authorization']

        if (!authHeader) {
            return respuesta.status(401).json({ message: 'Token no proporcionado' });
        }

        //el formato esperado es: "Bearer <token>" //el bearer es un tipo de metodo de tokens
        const token = authHeader.split(' ')[1]; //como mi toquen es Bearer <token>, hacemos un split y agarramos la posicion 1 que es token
        
        if (!token) {
            return respuesta.status(401).json({ message: 'Formato de token invalido' });
        }

        //verificamos la firma del token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        //guardamos los datos del usuario para uso interno
        request.userId = decoded.id;

        //continuar
        next();
        
    } catch (error) {
        logError('Middleware auth error', { error: error.message });
        return respuesta.status(401).json({ error: 'No autorizado' });
    }
}

module.exports = authMiddleware;