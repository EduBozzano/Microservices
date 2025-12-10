'use strict';

// import { createRequire } from 'node:module';
// const require = createRequire(import.meta.url);

// const axios = require('axios');
// const jwt = require('jsonwebtoken');

// const { Order, OrderItem } = require('../models/relations');
// const { logInfo, logError } = require('../utils/logger');
import axios from 'axios'
import jwt from 'jsonwebtoken'

import {Order, OrderItem} from '../models/relations.js'
import {logInfo, logError } from '../utils/logger.js'

import dotenv from 'dotenv';
dotenv.config();

// URL del Products Service (leyendo ENV)
const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL;

// Clave para verificar JWT
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

//Funcion para validar token
async function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    return payload; // contiene userId, asi podemos asociar la orden
  } catch (error) {
    logError('Token inválido al crear orden', { error: error.message });
    throw new Error('Invalid token');
  }
}

//funcion para consultar productos a products_service
// async function fetchProduct(productId) {
//   try {
//     const response = await axios.get(`${PRODUCTS_SERVICE_URL}/${productId}`);
//     return response.data;
//   } catch (error) {
//     logError('Error consultando producto', { productId, error: error.message });
//     throw new Error(`Product not found: ${productId}`);
//   }
// }
async function fetchProduct(productId) {
  //definimos la funcion para nuestra peticion en una constante fn
  const fn = async () => {
    const res = await axios.get(`${process.env.PRODUCTS_SERVICE_URL}/${productId}`, { timeout: 3000 });
    return res.data;
  };

  // Llamada via circuit breaker (fail-fast si OPEN)
  try {
    return await productsBreaker.call(fn, options);
  } catch (err) {
    // manejar error localmente, por ejemplo lanzar error con mensaje claro
    throw new Error(`No se pudo obtener el producto ${productId}: ${err.message}`);
  }
}


//FUNCION PRINCIPAL: Crea las ordenes
async function createOrder(userId, items) {
  // // Validar token
  // const user = await verifyToken(token);
  if (!userId) {
    throw new Error('userId requerido para crear orden');
  }

  // Validar items de entrada
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order items required');
  }

  // Consultar cada producto al Products Service y calculamos el total
  let total = 0;
  const enrichedItems = [];

  for (const item of items) {
    console.log(item);
    const product = await fetchProduct(item.productId);

    if (item.quantity <= 0) {
      throw new Error('Invalid quantity');
    }

    const lineTotal = product.price * item.quantity;
    total += lineTotal;

    enrichedItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price
    });
  }

  // Crear la orden en la BD
  const order = await Order.create({
    userId: userId,
    total,
    status: 'pending'
  });

  // Crear los items relacionados
  for (const it of enrichedItems) {
    await OrderItem.create({
      orderId: order.id,
      ...it //...it lo que hace es copiar todos los atributos del elemento seleccionado
    });
  }

  logInfo('Orden creada con éxito', { orderId: order.id });

  return {
    orderId: order.id,
    total,
    items: enrichedItems
  };
}

//Obtener una orden por ID
async function getOrderById(orderId) {
  const order = await Order.findByPk(orderId, {
    include: ['items']
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
}

//Listas u obtener ordenes de un usuario
async function getUserOrders(userId) {
  // // Validar token
  // const user = await verifyToken(token);
  // const userId = user.userId;

  return Order.findAll({
    where: { userId },
    include: ['items'],
    order: [['createdAt', 'DESC']]
  });
}

// module.exports = {
//   createOrder,
//   getOrderById,
//   getUserOrders
// };
export {
  verifyToken,
  createOrder,
  getOrderById,
  getUserOrders
};
