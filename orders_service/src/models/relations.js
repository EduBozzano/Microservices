'use strict';

// import { createRequire } from 'node:module';
// const require = createRequire(import.meta.url);

// const Order = require('./order.model');
// const OrderItem = require('./orderItem.model');

import {Order} from './order.model.js'
import {OrderItem} from './orderItem.model.js'

// 1 Orden → N Items
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items'
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

// module.exports = {
//   Order,
//   OrderItem
// };
export{
  Order,
  OrderItem,
}