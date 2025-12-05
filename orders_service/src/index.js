import app from './app.js';
import { connectToDatabase, closeDatabase } from './config/database.js';

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected.');

    app.listen(PORT, () => {
      console.log(`Orders Service running on port ${PORT}`);
    });

    // Cierre limpio
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      await closeDatabase();
      console.log('Database disconnected.');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
}

startServer();
