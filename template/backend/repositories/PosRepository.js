/**
 * PosRepository — datos específicos del punto de venta.
 * Tablas involucradas:
 *   - pos_branches { id, nombre, direccion, telefono, activa }
 *   - sales_orders + sales_order_items (para las ventas POS)
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const PosRepository = {
  /**
   * Búsqueda de productos activos (para el buscador POS).
   * @returns {Promise<object[]>}  { id, title, price, discount, image, barcode,
   *   category, stock, costo }
   */
  async searchProducts({ q = '', limit = 48 } = {}) { return NI() },

  /** @returns {Promise<object[]>}  { id, nombre, email, telefono, segmento } */
  async searchCustomers({ q = '' } = {}) { return NI() },

  /** @returns {Promise<object[]>}  sucursales activas */
  async listBranches() { return NI() },

  /**
   * Crea una venta POS con estado 'Pagada' + descuenta stock + registra movimientos.
   * TRANSACCIÓN ATÓMICA.
   * @returns {Promise<object>}  la venta creada con items + datos del operador/sucursal
   */
  async createSale({ items, metodo_pago, cliente_id, descuento = 0, sucursal_id, operador_id }) {
    return NI()
  },

  /**
   * Lista ventas POS por fecha (opcionalmente por sucursal).
   * @returns {Promise<object[]>}
   */
  async listSales({ fecha, sucursal_id, operador_sucursal_id } = {}) { return NI() },

  async getSaleById(id) { return NI() },

  /**
   * Reportes agregados del día (KPIs, por método de pago, top productos, ventas por hora).
   * @returns {Promise<{ fecha, kpis, byPayment, topProducts, hourly }>}
   */
  async getReports({ fecha, sucursal_id } = {}) { return NI() },
}

module.exports = PosRepository
