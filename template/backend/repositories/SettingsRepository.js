/**
 * SettingsRepository
 * Tabla: site_settings { clave VARCHAR PK, valor TEXT }
 * Clave-valor simple para configuración del sitio (ej. whatsapp_numero).
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const SettingsRepository = {
  /** @returns {Promise<object>}  objeto plano { clave: valor, ... } */
  async getAll() { return NI() },

  /**
   * Upsert de múltiples claves.
   * @param {object} pairs  { clave1: valor1, clave2: valor2 }
   */
  async upsertMany(pairs) { return NI() },
}

module.exports = SettingsRepository
