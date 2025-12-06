/**
 * src/models/order.model.js
 * Define el modelo de la orden
 */

'use strict';
// import { createRequire } from 'node:module';
// const require = createRequire(import.meta.url);

// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../config/database');
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  userId: {
    type: DataTypes.CHAR(24),
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },

  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }

}, {
  tableName: 'orders',
  timestamps: true, // createdAt y updatedAt
});

// module.exports = Order;
export{
  Order
}