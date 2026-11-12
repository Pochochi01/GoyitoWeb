/**
 * AnalyticsRepository — queries analíticas cross-tabla.
 * Todas las funciones aceptan un rango de fechas opcional (startDate, endDate).
 * Si no se pasa rango, generalmente asumen "mes actual" o "últimos N meses".
 */
'use strict'
const NI = () => { throw new Error('Repository method not implemented') }

const AnalyticsRepository = {
  /**
   * Analytics de productos.
   * @param {object} opts { startDate, endDate }
   * @returns {Promise<{ kpis, topByIngresos, byCategoria, monthly }>}
   *   kpis: { totalSkus, sinStock, stockBajo, margenProm }
   *   topByIngresos: [{ producto, unidades, ingresos, margen }]
   *   byCategoria:   [{ name, value }]
   *   monthly:       [{ mes, ventas, ecom, pos }]
   */
  async products({ startDate, endDate } = {}) { return NI() },

  /**
   * Analytics de ventas.
   * @returns {Promise<{ kpis, monthly, weekly, topProducts, paymentMethods, segmentacion, byCategoria }>}
   */
  async sales({ startDate, endDate } = {}) { return NI() },

  /**
   * Analytics de compras.
   * @returns {Promise<{ kpis, monthly, bySupplier, comprasVsVentas }>}
   */
  async purchases({ startDate, endDate } = {}) { return NI() },
}

module.exports = AnalyticsRepository
