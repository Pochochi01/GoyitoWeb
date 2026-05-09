/**
 * mp.config.js — Configuración Singleton de MercadoPago
 * ======================================================
 * PATRÓN SINGLETON via sistema de módulos de Node.js:
 *   El runtime cachea cada módulo tras la primera importación.
 *   Por tanto, `mpClient` se instancia UNA sola vez por proceso,
 *   sin importar cuántos archivos lo importen.
 *
 * DESACOPLAMIENTO DE CREDENCIALES:
 *   El token se lee exclusivamente desde process.env.MP_ACCESS_TOKEN.
 *   Para cambiar de cuenta de MercadoPago basta con:
 *     1. Actualizar MP_ACCESS_TOKEN en el archivo .env
 *     2. Reiniciar el proceso (nodemon lo hace automáticamente)
 *   → No se toca ningún archivo de lógica de negocio.
 *
 * AMBIENTE (TEST vs PRODUCCIÓN):
 *   - ACCESS_TOKEN que empieza con "TEST-" → Sandbox
 *   - ACCESS_TOKEN que empieza con "APP_USR-" → Producción
 *   El SDK de MercadoPago detecta esto automáticamente.
 */

import { MercadoPagoConfig } from 'mercadopago'

// ─── Guard: falla rápido si no hay token configurado ─────────
const accessToken = process.env.MP_ACCESS_TOKEN

if (!accessToken || accessToken.startsWith('TEST-xxxx')) {
  console.warn(
    '[MercadoPago] ⚠️  MP_ACCESS_TOKEN no configurado o es un placeholder. ' +
    'Configurá un token real en .env para procesar pagos.'
  )
}

/**
 * Instancia Singleton de MercadoPagoConfig.
 * Exportada como default — un único objeto compartido por toda la aplicación.
 *
 * @type {MercadoPagoConfig}
 */
const mpClient = new MercadoPagoConfig({
  accessToken: accessToken || '',
  options: {
    timeout:        5000,   // ms por request al API de MP
    retries:        3,      // reintentos automáticos ante fallos de red
  },
})

export default mpClient

/**
 * Metadata útil para logs y health-checks.
 * Nunca exponer el token completo; sólo el prefijo permite saber el ambiente.
 */
export const mpEnvironment = accessToken?.startsWith('APP_USR-')
  ? 'producción'
  : 'sandbox (TEST)'

export const mpAccountHint = accessToken
  ? `${accessToken.slice(0, 12)}…`
  : 'NO CONFIGURADO'
