// src/middlewares/auth.middleware.js

import {verifyToken} from '../services/orders.service.js';

// const service = new OrdersService();

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token no enviado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await verifyToken(token); // usamos el verify token existente en orders.services
    req.user = payload;  // dejamos disponible userId, email, etc.
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
