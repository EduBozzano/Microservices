/**
 * src/models/order.model.js
 * Define el modelo de cada producto de una orden
 */

'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  productId: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

}, {
  tableName: 'order_items',
  timestamps: false
});

module.exports = OrderItem;
