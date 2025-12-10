// src/utils/circuitBreaker.js
'use strict';

const { retryAsync } = require('./retry');

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5; // fallos antes de abrir
    this.successThreshold = options.successThreshold || 2; // éxitos para cerrar
    this.cooldownTime = options.cooldownTime || 10000; // ms que permanece abierto
    this.requestTimeout = options.requestTimeout || 5000; // timeout para cada request (opcional)
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = null; // timestamp cuando probar nuevamente
  }

  /**
   * Internal: marca un fallo
   */
  _onFailure() {
    this.failureCount += 1;
    this.successCount = 0;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.cooldownTime;
    }
  }

  /**
   * Internal: marca un exito
   */
  _onSuccess() {
    this.failureCount = 0;
    this.successCount += 1;
    if (this.state === 'HALF_OPEN' && this.successCount >= this.successThreshold) {
      this.state = 'CLOSED';
      this.successCount = 0;
    }
  }

  /**
   * call(fn): ejecuta fn respetando el estado del breaker.
   * fn debe ser una función que retorna una promesa.
   * options permite pasar retry options si querés usar retry internamente.
   */
  async call(fn, options = {}) {
    // si está abierto y no llegó el cooldown -> fail fast
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const err = new Error('Circuit breaker is OPEN');
        err.code = 'E_CIRCUIT_OPEN';
        throw err;
      }
      // periodo de prueba
      this.state = 'HALF_OPEN';
    }

    try {
      // opcional: envolver en retry
      const result = await retryAsync(fn, options.retry || {});
      // si llegó acá es éxito
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      // si estaba en HALF_OPEN y falla, volvemos a OPEN
      if (this.state === 'HALF_OPEN') {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.cooldownTime;
      }
      throw err;
    }
  }
}

module.exports = CircuitBreaker;
