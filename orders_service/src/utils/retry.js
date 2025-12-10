// src/utils/retry.js
'use strict';

//basicamente es una funcion para esperar y no saturar los reintentos
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * retryAsync(fn, options)
 * fn: función async que retorna una promesa
 * options:
 *  - retries: número máximo de intentos (por defecto 3)
 *  - minDelay: ms inicial (por defecto 100)
 *  - factor: backoff factor (por defecto 2)
 *  - jitter: true/false para añadir jitter aleatorio (por defecto true)
 */
async function retryAsync(fn, options = {}) {
  const {
    retries = 3,
    minDelay = 100,
    factor = 2,
    jitter = true,
    onRetry = null // callback(optional) (attempt, err) podemos por ejemplo enviar una funcion para logear el error
  } = options;                      //  onRetry: (attempt, err) => {console.log(`Intento ${attempt} falló: ${err.message}`);}

  let attempt = 0;
  let delay = minDelay;

  while (true) {
    try {
      attempt++;
      return await fn();

    } catch (err) {
      if (attempt >= retries) { //si los reintentos ya llegan al limite, retorna error
        throw err;
      }

      if (typeof onRetry === 'function') {
        try { onRetry(attempt, err); } catch (_) {}
      }

      // jitter: aleatorio entre 0.5*delay y 1.5*delay
      const actualDelay = jitter ? Math.floor(delay * (0.5 + Math.random())) : delay;

      await wait(actualDelay);
      delay = Math.floor(delay * factor);
    }
  }
}

// module.exports = { retryAsync };
export { retryAsync };