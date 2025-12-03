/**
 * src/models/order.model.js
 * Define el modelo de la orden
 */

'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  userId: {
    type: DataTypes.INTEGER,
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

module.exports = Order;
