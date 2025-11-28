/**
 * src/auth.service.js
 * Contiene la logica de negocio relacinada a la autenticacion
 * 
 * Responsabilidades:
 * - Registrar nuevos usuarios
 * - Validar credenciales
 * - Emitir tokens
 * 
 * Principios SOLID:
 * - SRP: solo maneja la logica de autenticacion
 * - High Cohesion: funciones relacionadas al mismo dominio (auth)
 * - Low Coupling: no depende del controlador ni de Express
 */

const bcrypt = require('bcryptjs');
const User = require('./user.model');
const { logInfo, logError } = require('./logger');
const jwt = require('jsonwebtoken'); //importamos jwt para los tokens

/**
 * EMPEZAMOS POR EL REGISTER
 */
// verificamos si el usuario ya existe
async function checkUserExists(email) {
    const existingUser = await User.findOne({ email }); 
    //findOne es una funcion de mongo, en la cual busca un documento en la coleccion users cuyo campo email coincida con el que se paso

    //lanzamos error si el usuario existe
    if (existingUser){
        logInfo('Intento de registro con email existente', { email })
        throw new Error('El email ya esta registrado');
    }
    return;
}

//funcion para hashear la contrasena y crear el usuario en la base de datos
async function createUser(email, password) {
    // hasheamos la contraseña
    /**
     * el hash es una especie de cifrado de seguridad, convertimos la contrasena a una serie de digitos alfanumericos irreversible para almacenarla en la base de datos
     * asi cuando el usuario se loguea, hasheamos su contrasena y comparamos con la que tenemos guardada 
     */
    const hashedPassword = await bcrypt.hash(password, 10); //el 10 indica el costo del hash (mientras mas alto mas seguro, pero mas lento el hash y consume mas recursos)

    //creamos el usuario
    const newUser = await User.create({ email, password: hashedPassword });
    
    return newUser;
}

//funcion register para devolver los datos utiles al controller
async function register(email, password) {
    await checkUserExists(email);
    const newUser = await createUser(email, password);
    
    //retornamos los datos
    return{
        id: newUser._id,
        email: newUser.email,
        createdAt: newUser.createdAt
    };
}

/**
 * APARTADO DE LOGIN
 */
//funcion para verificar si el email existe al logearse
async function findUserByEmail(email) {
    //buscamos el usuario
    const user = await User.findOne({ email });

    // si no existe lanzamos error generico
    if (!user) {
        throw new Error ('Credenciales Invalidas');
    }

    return user; //retornamos el usuario para usarlo luego
}

//funcion para verificar si la contrasena es correcta al loguearse
async function validatePassword(passwordIngresada, passwordAlmacenada) {
    const match = await bcrypt.compare(passwordIngresada, passwordAlmacenada); //comparamos las contrasenas

    if (!match){
        throw new Error('Credenciales Invalidas'); //si no coinciden lanzamos error
    }

    return true;
}

/**
 * GENERACION DE TOKENS
 */

//funcion para geenerar el access token
function generateAccessToken(user){
    return jwt.sign( { id: user._id, email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m'} );
}

//funcion parar generar el refresh token
function generateRefreshToken(user){
    return jwt.sign( { id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d'} );
}

//funcion para generar ambos tokens en conjunto
function generateAuthTokens(user){
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return { accessToken, refreshToken };
}

//hacemos la funcion de Login
async function login(email, password) {
    const user = await findUserByEmail(email);
    const isMatch = await validatePassword(password, user.password);
    const tokens = generateAuthTokens(user);

    return{
        id: user._id,
        email: user.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
    };
}

/**
 * Implemetamos las validaciones del refresh token
 */
async function refreshToken(refreshToken) {
    //validamos que se haya enviado el token
    if (!refreshToken){
        throw new Error('Refresh token requerido');
    }

    //verificamos la firma y decodificamos 
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // decoded tiene contenido : { id, email, iat, exp}
    } catch (error) {
        logError('Refresh token invalido', { error: error.message });
        throw new Error('Refresh token invalido o expirado');
    }

    //buscamos al usuario por id
    const user = await User.findById(decoded.id);

    if(!user){
        throw new Error('Usuario no encontrado para este refresh token')
    }

    //generamos nuevos tokens
    const newTokens = generateAuthTokens(user);

    //retornamos al controller
    return{
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
    };
}

/**
 * Devuelve los datos seguros del usuario (perfil) dado su id
 * No expone password ni datos sensibles 
 * @param {string} userId
 * @returns {object} { id, email, createdAt, updatedAtm... }
 */
async function getUserProfile(userId) {
    if(!userId){
        throw new Error('UserId es requerido');
    }

    const user = await User.findById(userId).select('-password'); //excluye password

    if (!user){
        throw new Error('Usuario no encontrado');
    }

    //Normalizamos la respuesta para el controller
    return{
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,      
    };
}

