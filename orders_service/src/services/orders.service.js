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
  // 1) Validar token
  const user = await verifyToken(token);

  // 2) Validar items de entrada
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order items required');
  }

  // 3) Consultar cada producto al Products Service
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

  // 4) Crear la orden en la BD
  const order = await Order.create({
    userId: user.userId,
    total,
    status: 'pending'
  });

  // 5) Crear los items relacionados
  for (const it of enrichedItems) {
    await OrderItem.create({
      orderId: order.id,
      ...it
    });
  }

  logInfo('Orden creada con éxito', { orderId: order.id });

  return {
    orderId: order.id,
    total,
    items: enrichedItems
  };
}
