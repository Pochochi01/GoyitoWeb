'use strict'
const { MercadoPagoConfig } = require('mercadopago')

const accessToken = process.env.MP_ACCESS_TOKEN

if (!accessToken || accessToken.startsWith('TEST-xxxx')) {
  console.warn(
    '[MercadoPago] ⚠️  MP_ACCESS_TOKEN no configurado o es un placeholder. ' +
    'Configurá un token real en .env para procesar pagos.'
  )
}

const mpClient = new MercadoPagoConfig({
  accessToken: accessToken || '',
  options: {
    timeout: 5000,
    retries: 3,
  },
})

const mpEnvironment = accessToken?.startsWith('APP_USR-') ? 'producción' : 'sandbox (TEST)'
const mpAccountHint = accessToken ? `${accessToken.slice(0, 12)}…` : 'NO CONFIGURADO'

// Exporta el cliente como default + las constantes como propiedades adicionales
module.exports            = mpClient
module.exports.mpEnvironment = mpEnvironment
module.exports.mpAccountHint = mpAccountHint
