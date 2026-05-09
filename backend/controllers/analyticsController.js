const { pool } = require('../config/db')

// ─── Helper: construye WHERE + params con filtros de fecha ────
function buildDateWhere(start, end, extra = "estado != 'Cancelada'") {
  const parts  = extra ? [extra] : []
  const params = []
  if (start) { parts.push('fecha >= ?'); params.push(start) }
  if (end)   { parts.push('fecha <= ?'); params.push(end) }
  return {
    clause: parts.length ? `WHERE ${parts.join(' AND ')}` : '',
    params,
  }
}

// ─── /api/analytics/products?startDate=&endDate= ─────────────
async function products(req, res, next) {
  try {
    const { startDate, endDate } = req.query

    const [[kpis]] = await pool.query(`
      SELECT
        COUNT(p.id)                                                                              AS totalSkus,
        SUM(CASE WHEN ps.stock = 0 THEN 1 ELSE 0 END)                                          AS sinStock,
        SUM(CASE WHEN ps.stock > 0 AND ps.stock < ps.stock_minimo THEN 1 ELSE 0 END)           AS stockBajo,
        ROUND(AVG(CASE WHEN ps.costo > 0 THEN (p.precio - ps.costo) / p.precio * 100 END), 1) AS margenProm
      FROM products p
      LEFT JOIN product_stock ps ON ps.producto_id = p.id
      WHERE p.activo = 1
    `)

    const { clause: sowhere, params: soparams } = buildDateWhere(startDate, endDate)

    const [topByIngresos] = await pool.query(
      `SELECT p.titulo AS producto,
              SUM(soi.cantidad)  AS unidades,
              SUM(soi.subtotal)  AS ingresos,
              ROUND(((p.precio - IFNULL(ps.costo,0)) / p.precio) * 100, 1) AS margen
       FROM sales_order_items soi
       JOIN products p ON p.id = soi.producto_id
       LEFT JOIN product_stock ps ON ps.producto_id = p.id
       JOIN sales_orders so ON so.id = soi.orden_id
       ${sowhere}
       GROUP BY soi.producto_id, p.titulo, p.precio, ps.costo
       ORDER BY ingresos DESC
       LIMIT 8`,
      soparams
    )

    const [byCategoria] = await pool.query(
      `SELECT c.nombre AS name, SUM(soi.subtotal) AS value
       FROM sales_order_items soi
       JOIN products p ON p.id = soi.producto_id
       JOIN categories c ON c.id = p.categoria_id
       JOIN sales_orders so ON so.id = soi.orden_id
       ${sowhere}
       GROUP BY c.id, c.nombre
       ORDER BY value DESC`,
      soparams
    )

    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(so.fecha, '%b') AS mes,
              SUM(so.total) AS ventas,
              SUM(CASE WHEN so.canal = 'E-commerce' THEN so.total ELSE 0 END) AS ecom,
              SUM(CASE WHEN so.canal = 'POS'         THEN so.total ELSE 0 END) AS pos
       FROM sales_orders so
       ${sowhere}
       GROUP BY DATE_FORMAT(so.fecha, '%Y-%m'), DATE_FORMAT(so.fecha, '%b')
       ORDER BY MIN(so.fecha)`,
      soparams
    )

    res.json({ kpis, topByIngresos, byCategoria, monthly })
  } catch (err) { next(err) }
}

// ─── /api/analytics/sales?startDate=&endDate= ────────────────
async function sales(req, res, next) {
  try {
    const { startDate, endDate } = req.query
    const hasRange = startDate || endDate

    // KPIs: si hay rango usa ese, si no usa el mes actual
    let kpisRaw
    if (hasRange) {
      const { clause, params } = buildDateWhere(startDate, endDate)
      ;[[kpisRaw]] = await pool.query(
        `SELECT SUM(total)  AS totalMes,
                COUNT(*)    AS totalOrdenes,
                ROUND(AVG(total), 0) AS ticketProm
         FROM sales_orders ${clause}`,
        params
      )
    } else {
      ;[[kpisRaw]] = await pool.query(`
        SELECT
          SUM(CASE WHEN MONTH(fecha)=MONTH(CURDATE()) AND YEAR(fecha)=YEAR(CURDATE()) THEN total ELSE 0 END)  AS totalMes,
          SUM(CASE WHEN MONTH(fecha)=MONTH(CURDATE()) AND YEAR(fecha)=YEAR(CURDATE()) THEN 1   ELSE 0 END)    AS totalOrdenes,
          ROUND(AVG(CASE WHEN MONTH(fecha)=MONTH(CURDATE()) AND YEAR(fecha)=YEAR(CURDATE()) THEN total END),0) AS ticketProm
        FROM sales_orders WHERE estado != 'Cancelada'
      `)
    }

    // Monthly chart
    const monthlyBase  = hasRange
      ? buildDateWhere(startDate, endDate)
      : { clause: `WHERE estado != 'Cancelada' AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 MONTH)`, params: [] }

    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(fecha,'%b') AS mes,
              SUM(total) AS ventas,
              SUM(CASE WHEN canal='E-commerce' THEN total ELSE 0 END) AS ecom,
              SUM(CASE WHEN canal='POS'         THEN total ELSE 0 END) AS pos,
              COUNT(*) AS ordenes
       FROM sales_orders
       ${monthlyBase.clause}
       GROUP BY DATE_FORMAT(fecha,'%Y-%m'), DATE_FORMAT(fecha,'%b')
       ORDER BY MIN(fecha)`,
      monthlyBase.params
    )

    // Weekly chart: dentro del rango seleccionado
    const weeklyStart = startDate || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-01`
    const weeklyEnd   = endDate   || new Date().toISOString().split('T')[0]
    const [weekly] = await pool.query(`
      SELECT CONCAT('Sem ', wk - week_base + 1) AS semana,
             SUM(total)  AS ventas,
             COUNT(*)    AS ordenes
      FROM (
        SELECT total,
               WEEK(fecha, 1) AS wk,
               WEEK(?, 1)     AS week_base
        FROM sales_orders
        WHERE estado != 'Cancelada'
          AND fecha BETWEEN ? AND ?
      ) t
      GROUP BY wk, week_base
      ORDER BY wk`,
      [weeklyStart, weeklyStart, weeklyEnd]
    )

    const { clause: c1, params: p1 } = buildDateWhere(startDate, endDate)
    const [topProducts] = await pool.query(
      `SELECT p.titulo AS producto,
              SUM(soi.cantidad) AS unidades,
              SUM(soi.subtotal) AS ingresos
       FROM sales_order_items soi
       JOIN products p ON p.id = soi.producto_id
       JOIN sales_orders so ON so.id = soi.orden_id
       ${c1}
       GROUP BY soi.producto_id, p.titulo
       ORDER BY unidades DESC
       LIMIT 8`,
      p1
    )

    const { clause: c2, params: p2 } = buildDateWhere(startDate, endDate)
    const [paymentMethods] = await pool.query(
      `SELECT metodo_pago AS name, COUNT(*) AS value
       FROM sales_orders ${c2}
       GROUP BY metodo_pago ORDER BY value DESC`,
      p2
    )

    const [segmentacion] = await pool.query(
      `SELECT segmento AS name, COUNT(*) AS value
       FROM customers GROUP BY segmento ORDER BY value DESC`
    )

    const { clause: c3, params: p3 } = buildDateWhere(startDate, endDate)
    const [byCategoria] = await pool.query(
      `SELECT c.nombre AS categoria, SUM(soi.subtotal) AS ventas
       FROM sales_order_items soi
       JOIN products p ON p.id = soi.producto_id
       JOIN categories c ON c.id = p.categoria_id
       JOIN sales_orders so ON so.id = soi.orden_id
       ${c3}
       GROUP BY c.id, c.nombre ORDER BY ventas DESC`,
      p3
    )

    res.json({ kpis: kpisRaw, monthly, weekly, topProducts, paymentMethods, segmentacion, byCategoria })
  } catch (err) { next(err) }
}

// ─── /api/analytics/purchases?startDate=&endDate= ────────────
async function purchases(req, res, next) {
  try {
    const { startDate, endDate } = req.query
    const hasRange = startDate || endDate

    // KPIs
    let kpisRaw
    if (hasRange) {
      const { clause, params } = buildDateWhere(startDate, endDate)
      ;[[kpisRaw]] = await pool.query(
        `SELECT SUM(total) AS totalMes,
                SUM(CASE WHEN estado IN ('Pendiente','En tránsito') THEN 1 ELSE 0 END) AS ordenesPend,
                COUNT(DISTINCT proveedor_id) AS proveedoresActivos,
                ROUND(AVG(NULLIF(dias_entrega,0)), 1) AS promEntrega
         FROM purchase_orders ${clause}`,
        params
      )
    } else {
      ;[[kpisRaw]] = await pool.query(`
        SELECT
          SUM(CASE WHEN MONTH(fecha)=MONTH(CURDATE()) AND YEAR(fecha)=YEAR(CURDATE()) THEN total ELSE 0 END) AS totalMes,
          SUM(CASE WHEN estado IN ('Pendiente','En tránsito') THEN 1 ELSE 0 END)                             AS ordenesPend,
          COUNT(DISTINCT proveedor_id)                                                                        AS proveedoresActivos,
          ROUND(AVG(NULLIF(dias_entrega,0)), 1)                                                               AS promEntrega
        FROM purchase_orders WHERE estado != 'Cancelada'
      `)
    }

    const poBase = hasRange
      ? buildDateWhere(startDate, endDate)
      : { clause: `WHERE estado != 'Cancelada' AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 MONTH)`, params: [] }

    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(fecha,'%b') AS mes, DATE_FORMAT(fecha,'%Y-%m') AS ym,
              SUM(total) AS monto, COUNT(*) AS ordenes
       FROM purchase_orders
       ${poBase.clause}
       GROUP BY DATE_FORMAT(fecha,'%Y-%m'), DATE_FORMAT(fecha,'%b')
       ORDER BY MIN(fecha)`,
      poBase.params
    )

    const { clause: c1, params: p1 } = buildDateWhere(startDate, endDate)
    const [bySupplier] = await pool.query(
      `SELECT s.nombre AS proveedor, SUM(po.total) AS monto
       FROM purchase_orders po
       JOIN suppliers s ON s.id = po.proveedor_id
       ${c1}
       GROUP BY po.proveedor_id, s.nombre
       ORDER BY monto DESC LIMIT 6`,
      p1
    )

    // Ventas en el mismo período para compras vs ventas
    const soBase = hasRange
      ? buildDateWhere(startDate, endDate)
      : { clause: `WHERE estado != 'Cancelada' AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 MONTH)`, params: [] }

    const [soMonthly] = await pool.query(
      `SELECT DATE_FORMAT(fecha,'%b') AS mes, DATE_FORMAT(fecha,'%Y-%m') AS ym, SUM(total) AS ventas
       FROM sales_orders ${soBase.clause}
       GROUP BY DATE_FORMAT(fecha,'%Y-%m'), DATE_FORMAT(fecha,'%b')
       ORDER BY MIN(fecha)`,
      soBase.params
    )

    const yms = [...new Set([...monthly.map(r=>r.ym), ...soMonthly.map(r=>r.ym)])].sort()
    const comprasVsVentas = yms.map(ym => {
      const po = monthly.find(r=>r.ym===ym)
      const so = soMonthly.find(r=>r.ym===ym)
      return { mes:(po||so).mes, compras: +(po?.monto||0), ventas: +(so?.ventas||0) }
    })

    res.json({ kpis: kpisRaw, monthly, bySupplier, comprasVsVentas })
  } catch (err) { next(err) }
}

module.exports = { products, sales, purchases }
