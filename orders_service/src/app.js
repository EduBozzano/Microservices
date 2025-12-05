import express from 'express';
import cors from 'cors';

// Routers
import productsRouter from '../products/products.router.js';
import ordersRouter from './orders/orders.router.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Routers
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);

// Manejo básico de errores de forma centralizada
app.use((err, req, res, next) => {
  console.error('Global Error:', err.message);

  res.status(400).json({
    error: err.message
  });
});

export default app;
