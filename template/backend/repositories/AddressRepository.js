/**
 * AddressRepository
 * Tabla: user_addresses { id, usuario_id, alias, calle, numero, piso,
 *                         ciudad, provincia, codigo_postal, es_principal, created_at }
 * FK usuario_id → users.id ON DELETE CASCADE
 *
 * Reglas de negocio:
 *   - Solo UNA dirección puede ser es_principal por usuario a la vez.
 *   - Al crear la primera dirección, marcarla como principal automáticamente.
 *   - Al borrar la principal y quedar otras, promover la más antigua a principal.
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const AddressRepository = {
  /** @returns {Promise<object[]>}  ORDER BY es_principal DESC, created_at ASC */
  async findByUser(usuario_id) { return NI() },

  /** @returns {Promise<object|null>} */
  async findByIdForUser(id, usuario_id) { return NI() },

  /** @returns {Promise<number>} count actual del usuario */
  async countByUser(usuario_id) { return NI() },

  /**
   * @returns {Promise<number>} id de la nueva dirección
   * IMPORTANTE: setea es_principal=1 si es la primera del usuario.
   */
  async create(usuario_id, { alias, calle, numero, piso, ciudad, provincia, codigo_postal, es_principal }) {
    return NI()
  },

  /**
   * Update parcial. Solo actualiza campos presentes en `fields`.
   * @returns {Promise<number>} filas afectadas
   */
  async update(id, usuario_id, fields) { return NI() },

  /**
   * @returns {Promise<number>} filas afectadas
   * IMPORTANTE: si se elimina la principal y quedan otras,
   * promover a principal la primera por created_at.
   */
  async delete(id, usuario_id) { return NI() },

  /** Marca una dirección como principal y desmarca las demás del usuario. */
  async setPrincipal(id, usuario_id) { return NI() },
}

module.exports = AddressRepository
