/**
 * src/auth.controller.js
 * Controlador para manejar las rutas de autenticacion
 * 
 * Este archivo NO contiene logica del negocio
 * Solo:
 * - Recibe datos de la request
 * - Llama al servicio correspondiente
 * - Envia la respuesta HTTP
 */

const authService = require('./auth.service');
const { logInfo, logError } = require('./logger');

//exportamos un objeto con todas las funciones necesarias (handlers)
module.exports = {
    register,
    login,
    refreshToken,
    getUserProfile
};

//implementamos el handler register
async function register(request, respuesta) {
    try {
        const { email, password } = request.body;

        const result = await authService.register(email, password);

        //registro exitoso
        return respuesta.status(201).json({
            message: 'Usuario registrado correctamente',
            user: result
        });
    } catch (error) {
        logError('Error en register', { error: error.message });

        //error del cliente (email duplicado, datos invalidos, etc)
        return respuesta.status(400).json({
            error: error.message
        });
    }  
}

//implementamos el handler login
async function login(request, respuesta) {
    try {
        const { email, password } = request.body;

        const result = await authService.login(email, password);

        return respuesta.status(200).json({
            message: 'Login exitoso',
            user: {
                id: result.id,
                email: result.email
            },
            tokens: {
                accesToken: result.accessToken,
                refreshToken: result.refreshToken
            }
        });
    } catch (error) {
        logError('Error en login', { error: error.message });

        return respuesta.status(400).json({
            error: error.message
        });
    }    
}

//implementamos el handler refresh
async function refreshToken(request, respuesta) {
    try {
        const { refreshToken } = request.body;

        const tokens = await authService.refreshToken(refreshToken);

        return respuesta.status(200).json({
            message: 'Tokens renovados exitosamente',
            tokens
        });
    } catch (error) {
        logError('Error en refresh token', {error: error.message});
        return respuesta.status(400).json({
            error: error.message
        });
    }
}

//implementamos el handler para retornar los datos
async function getUserProfile(request, respuesta) {
    try {
        // request.userId se establece en el middleware de autenticacion
        const userId = request.userId;

        const userData = await authService.getUserProfile(userId);

        return respuesta.status(200).json({
            message: 'Datos del usuario obtenidos correctamente',
            user: userData
        });
    } catch (error) {
        logError('Error en obtener los datos del usuario', {error : error.message});

        return respuesta.status(400).json({
            error: error.message
        });
    }
}