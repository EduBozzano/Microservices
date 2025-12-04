'use strict';

const axios = require('axios');
const jwt = require('jsonwebtoken');

const { Order, OrderItem } = require('./relations');
const { logInfo, logError } = require('../utils/logger');

// URL del Products Service (leyendo ENV)
const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL;

// Clave para verificar JWT
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;

//Funcion para validar token
async function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_PUBLIC_KEY);
    return payload; // contiene userId, asi podemos asociar la orden
  } catch (error) {
    logError('Token inválido al crear orden', { error: error.message });
    throw new Error('Invalid token');
  }
}

//funcion para consultar productos a products_service
async function fetchProduct(productId) {
  try {
    const response = await axios.get(`${PRODUCTS_SERVICE_URL}/${productId}`);
    return response.data;
  } catch (error) {
    logError('Error consultando producto', { productId, error: error.message });
    throw new Error(`Product not found: ${productId}`);
  }
}

//FUNCION PRINCIPAL: Crea las ordenes
async function createOrder(token, items) {
  // Validar token
  const user = await verifyToken(token);

  // Validar items de entrada
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order items required');
  }

  // Consultar cada producto al Products Service y calculamos el total
  let total = 0;
  const enrichedItems = [];

  for (const item of items) {
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
    userId: user.userId,
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
async function getUserOrders(token) {
  // Validar token
  const user = await verifyToken(token);
  const userId = user.userId;

  return Order.findAll({
    where: { userId },
    include: ['items'],
    order: [['createdAt', 'DESC']]
  });
}

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders
};
