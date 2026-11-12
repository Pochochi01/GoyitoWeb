/**
 * PurchaseOrderRepository
 * Modelo: { id, fecha, proveedor_id, estado, comprobante, dias_entrega, total, created_at }
 * estado: enum ('Pendiente' | 'En tránsito' | 'Recibida' | 'Cancelada')
 *
 * Tabla items: purchase_order_items (id, orden_id, producto_id, nombre_producto,
 *              cantidad, precio_unit, subtotal GENERATED)
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const PurchaseOrderRepository = {
  /** @param {object} opts { estado, proveedor_id, startDate, endDate, page, limit } */
  async list({ estado, proveedor_id, startDate, endDate, page = 1, limit = 50 } = {}) {
    return NI()
  },

  /** @returns {Promise<object|null>}  incluye array `items` */
  async findById(id) { return NI() },

  /**
   * @param {object} data { fecha, proveedor_id, estado, comprobante, dias_entrega, total, items }
   * @param {*} conn  transacción opcional
   * @returns {Promise<number>} id
   */
  async create({ fecha, proveedor_id, estado, comprobante, dias_entrega, total, items }, conn) {
    return NI()
  },

  async updateEstado(id, estado) { return NI() },
}

module.exports = PurchaseOrderRepository
