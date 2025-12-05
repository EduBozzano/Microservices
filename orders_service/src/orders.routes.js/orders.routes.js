// orders.routes.js
import { Router } from 'express';
import OrdersController from '../controllers/orders.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();
const controller = new OrdersController();

// Crear una nueva orden
router.post('/', authMiddleware, controller.createOrder);

// Obtener todas las órdenes del usuario autenticado
router.get('/', authMiddleware, controller.getMyOrders);

export default router;
