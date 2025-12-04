/**
 * src/controllers/orders.controller.js
 * Se encarga de validar datos basicos y delegar logica a orders.service
 */

// orders.controller.js
import OrdersService from '../services/orders.service.js';

//creamos una clase que va a mentener los metodos de crear y obtener ordenes, y entonces la exportamos
export default class OrdersController {
  constructor() {
    this.ordersService = new OrdersService();
  }

  // Crear una nueva orden     //En clases, los métodos suelen ser flecha porque así no se pierde el this cuando esos métodos se pasan como callbacks.
  createOrder = async (req, res) => {
    try {
      // Obtener token del encabezado
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'Token no enviado' });
      }

      const token = authHeader.split(' ')[1]; // "Bearer xxx"

      // Validar body: items debe existir y ser array
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'items debe ser un array con elementos' });
      }

      // Llamar al servicio createOrder de orders.service
      const newOrder = await this.ordersService.createOrder(token, items);

      // Respuesta
      return res.status(201).json({
        message: 'Orden creada con éxito',
        order: newOrder,
      });
    } catch (error) {
      console.error('Error en controller:', error.message);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

  // Obtener órdenes del usuario autenticado
  getMyOrders = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'Token no enviado' });
      }

      const token = authHeader.split(' ')[1];

      const orders = await this.ordersService.getUserOrders(token);

      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error en controller:', error.message);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  };
}
