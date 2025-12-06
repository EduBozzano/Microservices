/**
 * src/user.model.js
 * Representa un usuario registrado en el sistema
 * 
 * Responsabilidades:
 * - Definir la estructura de datos de un usuario.
 * - Establecer restricciones: eemail unico, password obligatoria.
 * - Facilitar su uso desde los servicios de negocio.
 * 
 * Principios:
 * - Responsabilidad unica (SRP): Solo define la estructura y reglas de datos
 * - Clean code: nombres claros sin logica innecesaria.
 */

//importamos mongoose para crear el modelo del usuario
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("User", userSchema);

