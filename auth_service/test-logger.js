// scripts/test-logger.js
require('dotenv').config();
const { logDebug, logInfo, logWarn, logError } = require('./src/logger');
console.log("NODE_ENV =", process.env.NODE_ENV);

logDebug('mensaje debug', { feature: 'auth', step: 1 });
logInfo('mensaje info', { feature: 'auth', step: 2 });
logWarn('advertencia leve', { feature: 'auth', step: 3 });
logError('error crítico de prueba', { feature: 'auth', code: 123 });
