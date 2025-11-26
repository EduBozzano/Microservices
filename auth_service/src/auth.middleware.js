/**
 * src/auth.middleware.js
 * Middleware para proteger rutas usando JWT
 */

const jwt = require('jsonwebtoken');
const { logError } = require('../logger');

async function authMiddleware(request, respuesta, next) {
    try {
        
    } catch (error) {
        logError('Middleware auth error', { error: error.message });
        return respuesta.status(401).json({ error: 'No autorizado' });
    }
}

module.exports = authMiddleware;