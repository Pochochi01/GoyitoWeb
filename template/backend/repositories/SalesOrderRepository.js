/**
 * SalesOrderRepository
 * Modelo: { id, fecha, canal, cliente_id, operador_id, estado, metodo_pago,
 *           mp_payment_id, total, created_at }
 *
 * canal: enum ('E-commerce' | 'POS')
 * estado: enum ('Pendiente' | 'Pagada' | 'Enviada' | 'Entregada' | 'Cancelada')
 * metodo_pago: enum ('MercadoPago' | 'Efectivo' | 'Tarjeta Cred' | 'Débito' | 'Transferencia')
 * mp_payment_id: VARCHAR(50) UNIQUE NULL  ← crítico para idempotencia con MP
 *
 * Tabla items: sales_order_items (id, orden_id, producto_id, nombre_producto,
 *              cantidad, precio_unit, subtotal GENERATED)
 * FK producto_id → products.id ON DELETE SET NULL (mantiene historial)
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const SalesOrderRepository = {
  async list({ estado, canal, cliente_id, startDate, endDate, page = 1, limit = 50 } = {}) {
    return NI()
  },

  /** @returns {Promise<object|null>}  incluye array `items` */
  async findById(id) { return NI() },

  /**
   * Idempotencia MP: busca la orden vinculada a un payment_id.
   * @returns {Promise<object|null>}
   */
  async findByMpPaymentId(paymentId) { return NI() },

  /**
   * @param {object} data { fecha, canal, cliente_id, operador_id, estado,
   *                        metodo_pago, mp_payment_id, total, items }
   * @param {*} conn  transacción opcional (RECOMENDADO)
   *
   * ATENCIÓN: si el INSERT viola el UNIQUE de mp_payment_id, propagá el error
   * con `code === 'ER_DUP_ENTRY'` (MySQL) o `'23505'` (Postgres) para que el
   * caller pueda hacer el fallback a findByMpPaymentId.
   */
  async create(data, conn) { return NI() },

  async updateEstado(id, estado) { return NI() },

  /** @param {object} opts { desde, hasta, startDate, endDate } */
  async summary({ desde, hasta, startDate, endDate } = {}) { return NI() },
}

module.exports = SalesOrderRepository
