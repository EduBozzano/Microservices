/**
 * products.model.js
 * Definimos el modelo de los productos en nuestra base de datos
 */
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'el nombre del producto es obligatorio'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'el precio es obligatorio'],
            min: [0, 'el precio no puede ser negativo'],
        },
        category: {
            type: String,
            required: [true, 'la categoria es obligatoria'],
            trim: true,
        },
        stock: {
            type: Number,
            required: [true, 'el stock es obligatorio'],
            min: [0, "el stock no puede ser negativo"],
        },
        imageUrl: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true, //createdAt y updateAt automaticos
        versionKey: false, //elimina __v que agrega mongoose automaticamente
    }
);

module.exports = mongoose.model('Product', ProductSchema);