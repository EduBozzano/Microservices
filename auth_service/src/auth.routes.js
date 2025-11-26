/**
 * src/auth.routes.js
 * Definimos endpoints REST del microservicio y middlewares de autenticacion
 * Responsabilidad: manejar post, get y errores
 */

const express = requiere('express'); 
const router = express.Router(); //permite modularizar rutas, separando la lógica de endpoints del index.js.
const authController = require('../auth.controller');
const authMiddleware = require('../auth.middleware'); //para proteger rutas

//Definir rutas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authMiddleware, authController.getUserprofile);

//exportamos el router
module.exports = router;

