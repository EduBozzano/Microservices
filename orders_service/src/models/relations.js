'use strict';

const Order = require('./order.model');
const OrderItem = require('./orderItem.model');

// 1 Orden → N Items
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items'
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

module.exports = {
  Order,
  OrderItem
};
