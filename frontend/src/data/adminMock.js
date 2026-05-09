// ─── Colores para gráficos ────────────────────────────────────────────────
export const CHART_COLORS = ['#f42c37','#1376f4','#2dcc6f','#fdc62e','#8b5cf6','#f97316','#06b6d4','#ec4899']

// ─── Series temporales ───────────────────────────────────────────────────
export const VENTAS_MENSUALES = [
  { mes:'Oct', ventas:98000,  costo:60000, unidades:185, ecom:55000, pos:43000 },
  { mes:'Nov', ventas:125000, costo:77000, unidades:234, ecom:71000, pos:54000 },
  { mes:'Dic', ventas:198000, costo:122000,unidades:387, ecom:118000,pos:80000 },
  { mes:'Ene', ventas:145000, costo:89000, unidades:276, ecom:82000, pos:63000 },
  { mes:'Feb', ventas:167000, costo:103000,unidades:318, ecom:97000, pos:70000 },
  { mes:'Mar', ventas:189000, costo:116000,unidades:359, ecom:110000,pos:79000 },
  { mes:'Abr', ventas:212000, costo:130000,unidades:402, ecom:127000,pos:85000 },
]

export const VENTAS_SEMANALES = [
  { semana:'S1', ventas:48000, ordenes:92  },
  { semana:'S2', ventas:53000, ordenes:104 },
  { semana:'S3', ventas:61000, ordenes:119 },
  { semana:'S4', ventas:50000, ordenes:97  },
]

// ─── Ventas por categoría (pie) ─────────────────────────────────────────
export const VENTAS_CATEGORIA = [
  { name:'Auriculares', value:32 },
  { name:'Laptops',     value:25 },
  { name:'Gaming',      value:18 },
  { name:'Smartwatch',  value:12 },
  { name:'Parlantes',   value:8  },
  { name:'Teléfonos',   value:5  },
]

// ─── Top productos por ventas ────────────────────────────────────────────
export const TOP_PRODUCTOS = [
  { producto:'MacBook Air M2',       unidades:142, ingresos:213000, margen:22 },
  { producto:'Headset VR Gaming',    unidades:198, ingresos:176220, margen:18 },
  { producto:'Notebook Samsung Ultra',unidades:89, ingresos:106800, margen:20 },
  { producto:'Smartwatch Premium',   unidades:215, ingresos:52675, margen:28 },
  { producto:'Auricular Sanyo Bass', unidades:310, ingresos:104040, margen:24 },
  { producto:'Teléfono Android 5G',  unidades:67,  ingresos:46833, margen:15 },
  { producto:'Auricular JBL Pro',    unidades:420, ingresos:50400, margen:30 },
  { producto:'Auricular Gaming Pro', unidades:278, ingresos:52275, margen:26 },
]

// ─── Métodos de pago ─────────────────────────────────────────────────────
export const METODOS_PAGO = [
  { name:'Tarjeta Crédito', value:40 },
  { name:'MercadoPago',     value:28 },
  { name:'Efectivo',        value:18 },
  { name:'Transferencia',   value:10 },
  { name:'Débito',          value:4  },
]

// ─── Stock por producto ───────────────────────────────────────────────────
export const STOCK_DATA = [
  { id:1,  nombre:'Auricular JBL Pro',         cat:'Auriculares', stock:45,  minimo:10, ubicacion:'A-1', costo:84,   venta:120, activo:true,  oferta:false },
  { id:2,  nombre:'Auricular Sanyo Bass',       cat:'Auriculares', stock:8,   minimo:15, ubicacion:'A-2', costo:336,  venta:420, activo:true,  oferta:true  },
  { id:3,  nombre:'Auricular Red Sound',        cat:'Auriculares', stock:23,  minimo:10, ubicacion:'A-3', costo:224,  venta:320, activo:true,  oferta:false },
  { id:4,  nombre:'Auricular JS Studio',        cat:'Auriculares', stock:0,   minimo:10, ubicacion:'A-4', costo:187,  venta:220, activo:true,  oferta:true  },
  { id:5,  nombre:'MacBook Air M2',             cat:'Laptops',     stock:12,  minimo:5,  ubicacion:'B-1', costo:1125, venta:1500,activo:true,  oferta:false },
  { id:6,  nombre:'Notebook Samsung Ultra',     cat:'Laptops',     stock:6,   minimo:5,  ubicacion:'B-2', costo:960,  venta:1200,activo:true,  oferta:true  },
  { id:7,  nombre:'Smartwatch Premium',         cat:'Smartwatch',  stock:3,   minimo:8,  ubicacion:'C-1', costo:245,  venta:350, activo:true,  oferta:true  },
  { id:8,  nombre:'Smartwatch Lite',            cat:'Smartwatch',  stock:31,  minimo:8,  ubicacion:'C-2', costo:139,  venta:199, activo:true,  oferta:false },
  { id:9,  nombre:'Headset VR Gaming',          cat:'Gaming',      stock:19,  minimo:5,  ubicacion:'D-1', costo:623,  venta:890, activo:true,  oferta:true  },
  { id:10, nombre:'Auricular Gaming Pro',       cat:'Gaming',      stock:55,  minimo:10, ubicacion:'D-2', costo:187,  venta:250, activo:true,  oferta:true  },
  { id:11, nombre:'Parlante Bass 360',          cat:'Parlantes',   stock:0,   minimo:5,  ubicacion:'E-1', costo:126,  venta:180, activo:true,  oferta:false },
  { id:12, nombre:'Auricular Sony WH',          cat:'Auriculares', stock:14,  minimo:8,  ubicacion:'A-5', costo:196,  venta:280, activo:true,  oferta:false },
  { id:13, nombre:'Headphone Studio',           cat:'Auriculares', stock:2,   minimo:5,  ubicacion:'A-6', costo:127,  venta:195, activo:true,  oferta:true  },
  { id:14, nombre:'Earphone Inalámbrico',       cat:'Auriculares', stock:78,  minimo:15, ubicacion:'A-7', costo:58,   venta:89,  activo:true,  oferta:false },
  { id:15, nombre:'Parlante Portátil',          cat:'Parlantes',   stock:22,  minimo:10, ubicacion:'E-2', costo:84,   venta:120, activo:true,  oferta:true  },
  { id:16, nombre:'Teléfono Android 5G',        cat:'Teléfonos',   stock:9,   minimo:5,  ubicacion:'F-1', costo:489,  venta:699, activo:true,  oferta:false },
]

// ─── Movimientos de stock ─────────────────────────────────────────────────
export const MOVIMIENTOS_STOCK = [
  { id:'M-001', fecha:'2026-04-20', producto:'Auricular JBL Pro',    tipo:'Entrada',  cant:+30, motivo:'Compra PO-012', usuario:'admin' },
  { id:'M-002', fecha:'2026-04-20', producto:'Auricular Sanyo Bass', tipo:'Salida',   cant:-5,  motivo:'Venta #V-0089', usuario:'pos'   },
  { id:'M-003', fecha:'2026-04-19', producto:'MacBook Air M2',       tipo:'Ajuste',   cant:-1,  motivo:'Daño en depósito', usuario:'admin' },
  { id:'M-004', fecha:'2026-04-19', producto:'Smartwatch Premium',   tipo:'Salida',   cant:-3,  motivo:'Venta #V-0088', usuario:'pos'   },
  { id:'M-005', fecha:'2026-04-18', producto:'Auricular JS Studio',  tipo:'Salida',   cant:-8,  motivo:'Venta #V-0087', usuario:'ecom'  },
  { id:'M-006', fecha:'2026-04-18', producto:'Headset VR Gaming',    tipo:'Entrada',  cant:+20, motivo:'Compra PO-011', usuario:'admin' },
  { id:'M-007', fecha:'2026-04-17', producto:'Parlante Bass 360',    tipo:'Salida',   cant:-6,  motivo:'Venta #V-0086', usuario:'pos'   },
  { id:'M-008', fecha:'2026-04-17', producto:'Notebook Samsung Ultra',tipo:'Transferencia',cant:-4, motivo:'Sucursal Norte', usuario:'admin' },
  { id:'M-009', fecha:'2026-04-16', producto:'Auricular Gaming Pro', tipo:'Entrada',  cant:+50, motivo:'Compra PO-010', usuario:'admin' },
  { id:'M-010', fecha:'2026-04-16', producto:'Smartwatch Lite',      tipo:'Ajuste',   cant:+5,  motivo:'Corrección inventario', usuario:'admin' },
]

// ─── Historial de precios ─────────────────────────────────────────────────
export const HISTORIAL_PRECIOS = [
  { fecha:'2025-10-01', producto:'Auricular JBL Pro',   precio:105, motivo:'Precio inicial' },
  { fecha:'2025-11-15', producto:'Auricular JBL Pro',   precio:115, motivo:'Actualización proveedor' },
  { fecha:'2026-01-10', producto:'Auricular JBL Pro',   precio:120, motivo:'Ajuste inflación' },
  { fecha:'2025-10-01', producto:'MacBook Air M2',       precio:1400, motivo:'Precio inicial' },
  { fecha:'2025-12-01', producto:'MacBook Air M2',       precio:1450, motivo:'Actualización proveedor' },
  { fecha:'2026-02-01', producto:'MacBook Air M2',       precio:1500, motivo:'Ajuste dólar' },
  { fecha:'2025-10-01', producto:'Headset VR Gaming',    precio:850, motivo:'Precio inicial' },
  { fecha:'2026-01-20', producto:'Headset VR Gaming',    precio:890, motivo:'Ajuste inflación' },
]

// ─── Proveedores ──────────────────────────────────────────────────────────
export const SUPPLIERS = [
  { id:'S-001', nombre:'TechDistrib SA',       cuit:'30-71234567-8', contacto:'Carlos Ruiz',    email:'ventas@techdistrib.com', tel:'+54 11 4567-8901', condPago:'30 días',  puntaje:4.8, compras:28, totalComprado:890000 },
  { id:'S-002', nombre:'ElectroImport Ltda',   cuit:'30-65432198-5', contacto:'Ana Martínez',   email:'ana@electroimport.com',  tel:'+54 11 3456-7890', condPago:'15 días',  puntaje:4.2, compras:15, totalComprado:420000 },
  { id:'S-003', nombre:'GlobalTech SRL',       cuit:'30-54321876-2', contacto:'Luis Pérez',     email:'luis@globaltech.com',    tel:'+54 11 2345-6789', condPago:'Contado',  puntaje:3.9, compras:8,  totalComprado:310000 },
  { id:'S-004', nombre:'AudioPro Distribución',cuit:'30-43218765-1', contacto:'María López',    email:'mlopez@audiopro.com',    tel:'+54 11 1234-5678', condPago:'60 días',  puntaje:4.6, compras:21, totalComprado:580000 },
  { id:'S-005', nombre:'SamsungArg Oficial',   cuit:'30-98765432-1', contacto:'Javier Torres', email:'javier@samsungarg.com',  tel:'+54 11 9876-5432', condPago:'30 días',  puntaje:4.9, compras:34, totalComprado:1250000 },
]

// ─── Compras ──────────────────────────────────────────────────────────────
export const COMPRAS = [
  {
    id:'#PO-001', fecha:'2026-04-15', proveedor:'TechDistrib SA', estado:'Recibida',
    items:[{ nombre:'Auricular JBL Pro', cant:30, precioUnit:80, subtotal:2400 },
           { nombre:'Headset VR Gaming', cant:20, precioUnit:600, subtotal:12000 }],
    total:14400, comprobante:'FAC-A-00001234', diasEntrega:3,
  },
  {
    id:'#PO-002', fecha:'2026-04-12', proveedor:'SamsungArg Oficial', estado:'En tránsito',
    items:[{ nombre:'Notebook Samsung Ultra', cant:10, precioUnit:950, subtotal:9500 },
           { nombre:'Smartwatch Premium', cant:15, precioUnit:240, subtotal:3600 }],
    total:13100, comprobante:'FAC-A-00005678', diasEntrega:null,
  },
  {
    id:'#PO-003', fecha:'2026-04-08', proveedor:'AudioPro Distribución', estado:'Recibida',
    items:[{ nombre:'Auricular Sanyo Bass', cant:20, precioUnit:330, subtotal:6600 },
           { nombre:'Parlante Bass 360', cant:15, precioUnit:120, subtotal:1800 }],
    total:8400, comprobante:'FAC-A-00002345', diasEntrega:5,
  },
  {
    id:'#PO-004', fecha:'2026-04-05', proveedor:'ElectroImport Ltda', estado:'Pendiente',
    items:[{ nombre:'Teléfono Android 5G', cant:8, precioUnit:480, subtotal:3840 }],
    total:3840, comprobante:null, diasEntrega:null,
  },
  {
    id:'#PO-005', fecha:'2026-03-28', proveedor:'GlobalTech SRL', estado:'Cancelada',
    items:[{ nombre:'MacBook Air M2', cant:5, precioUnit:1100, subtotal:5500 }],
    total:5500, comprobante:null, diasEntrega:null,
  },
  {
    id:'#PO-006', fecha:'2026-03-20', proveedor:'TechDistrib SA', estado:'Recibida',
    items:[{ nombre:'Auricular Gaming Pro', cant:50, precioUnit:185, subtotal:9250 },
           { nombre:'Auricular JBL Pro', cant:40, precioUnit:80, subtotal:3200 }],
    total:12450, comprobante:'FAC-A-00003456', diasEntrega:2,
  },
]

export const COMPRAS_MENSUALES = [
  { mes:'Oct', monto:62000,  ordenes:6  },
  { mes:'Nov', mes2:'Nov',monto:78000,  ordenes:8  },
  { mes:'Dic', monto:95000,  ordenes:11 },
  { mes:'Ene', monto:71000,  ordenes:7  },
  { mes:'Feb', monto:83000,  ordenes:9  },
  { mes:'Mar', monto:88000,  ordenes:10 },
  { mes:'Abr', monto:57700,  ordenes:5  },
]

export const PROVEEDOR_RANKING = [
  { proveedor:'SamsungArg Oficial',    monto:1250000 },
  { proveedor:'TechDistrib SA',        monto:890000  },
  { proveedor:'AudioPro Distribución', monto:580000  },
  { proveedor:'ElectroImport Ltda',    monto:420000  },
  { proveedor:'GlobalTech SRL',        monto:310000  },
]

// ─── Ventas / Órdenes ────────────────────────────────────────────────────
export const VENTAS_ORDENES = [
  { id:'#V-0001', fecha:'2026-04-22', canal:'E-commerce', cliente:'Juan Pérez',     operador:null,     estado:'Entregada',  pago:'MercadoPago', total:340.00,  items:[{n:'Auricular JBL Pro',q:1,p:120},{n:'Auricular JS Studio',q:1,p:220}] },
  { id:'#V-0002', fecha:'2026-04-22', canal:'POS',        cliente:'María García',   operador:'pos01',  estado:'Pagada',     pago:'Efectivo',    total:1500.00, items:[{n:'MacBook Air M2',q:1,p:1500}] },
  { id:'#V-0003', fecha:'2026-04-21', canal:'E-commerce', cliente:'Carlos López',   operador:null,     estado:'Enviada',    pago:'Tarjeta Cred',total:220.00,  items:[{n:'Auricular JS Studio',q:1,p:220}] },
  { id:'#V-0004', fecha:'2026-04-21', canal:'POS',        cliente:'Ana Rodríguez',  operador:'pos02',  estado:'Cancelada',  pago:'Débito',      total:699.00,  items:[{n:'Teléfono Android 5G',q:1,p:699}] },
  { id:'#V-0005', fecha:'2026-04-20', canal:'E-commerce', cliente:'Pedro Sánchez',  operador:null,     estado:'Entregada',  pago:'Transferencia',total:730.00, items:[{n:'Auricular Sanyo Bass',q:1,p:336},{n:'Smartwatch Lite',q:1,p:199},{n:'Auricular JBL Pro',q:1,p:120}] },
  { id:'#V-0006', fecha:'2026-04-20', canal:'POS',        cliente:'Laura Gómez',    operador:'pos01',  estado:'Pendiente',  pago:'Tarjeta Cred',total:890.00,  items:[{n:'Headset VR Gaming',q:1,p:890}] },
  { id:'#V-0007', fecha:'2026-04-19', canal:'E-commerce', cliente:'Roberto Silva',  operador:null,     estado:'Entregada',  pago:'MercadoPago', total:480.00,  items:[{n:'Auricular Gaming Pro',q:1,p:187},{n:'Smartwatch Lite',q:1,p:199},{n:'Auricular JBL Pro',q:1,p:94}] },
  { id:'#V-0008', fecha:'2026-04-19', canal:'POS',        cliente:'Sofía Torres',   operador:'pos02',  estado:'Pagada',     pago:'Efectivo',    total:199.00,  items:[{n:'Smartwatch Lite',q:1,p:199}] },
  { id:'#V-0009', fecha:'2026-04-18', canal:'E-commerce', cliente:'Diego Moreno',   operador:null,     estado:'Enviada',    pago:'Tarjeta Cred',total:2700.00, items:[{n:'MacBook Air M2',q:1,p:1500},{n:'Headset VR Gaming',q:1,p:890},{n:'Smartwatch Lite',q:1,p:199}] },
  { id:'#V-0010', fecha:'2026-04-18', canal:'POS',        cliente:'Valentina Cruz', operador:'pos01',  estado:'Entregada',  pago:'MercadoPago', total:420.00,  items:[{n:'Auricular Sanyo Bass',q:1,p:420}] },
  { id:'#V-0011', fecha:'2026-04-17', canal:'E-commerce', cliente:'Martín Ruiz',    operador:null,     estado:'Entregada',  pago:'Transferencia',total:350.00, items:[{n:'Smartwatch Premium',q:1,p:350}] },
  { id:'#V-0012', fecha:'2026-04-17', canal:'POS',        cliente:'Camila Díaz',    operador:'pos02',  estado:'Cancelada',  pago:'Tarjeta Cred',total:280.00,  items:[{n:'Auricular Sony WH',q:1,p:280}] },
]

// ─── Clientes ─────────────────────────────────────────────────────────────
export const CLIENTES = [
  { id:'C-001', nombre:'Juan Pérez',      email:'juan@mail.com',  compras:12, totalGastado:4850, ticketPromedio:404, ultimaCompra:'2026-04-22', segmento:'VIP'      },
  { id:'C-002', nombre:'María García',    email:'maria@mail.com', compras:8,  totalGastado:9200, ticketPromedio:1150,ultimaCompra:'2026-04-22', segmento:'Premium'  },
  { id:'C-003', nombre:'Carlos López',    email:'carlos@mail.com',compras:5,  totalGastado:1100, ticketPromedio:220, ultimaCompra:'2026-04-21', segmento:'Regular'  },
  { id:'C-004', nombre:'Pedro Sánchez',   email:'pedro@mail.com', compras:15, totalGastado:6200, ticketPromedio:413, ultimaCompra:'2026-04-20', segmento:'VIP'      },
  { id:'C-005', nombre:'Laura Gómez',     email:'laura@mail.com', compras:3,  totalGastado:2100, ticketPromedio:700, ultimaCompra:'2026-04-20', segmento:'Regular'  },
  { id:'C-006', nombre:'Roberto Silva',   email:'roberto@mail.com',compras:7, totalGastado:3150, ticketPromedio:450, ultimaCompra:'2026-04-19', segmento:'Regular'  },
  { id:'C-007', nombre:'Diego Moreno',    email:'diego@mail.com', compras:4,  totalGastado:7800, ticketPromedio:1950,ultimaCompra:'2026-04-18', segmento:'Premium'  },
  { id:'C-008', nombre:'Valentina Cruz',  email:'valen@mail.com', compras:9,  totalGastado:2890, ticketPromedio:321, ultimaCompra:'2026-04-18', segmento:'Regular'  },
  { id:'C-009', nombre:'Martín Ruiz',     email:'martin@mail.com',compras:11, totalGastado:3850, ticketPromedio:350, ultimaCompra:'2026-04-17', segmento:'VIP'      },
  { id:'C-010', nombre:'Camila Díaz',     email:'camila@mail.com',compras:2,  totalGastado:560,  ticketPromedio:280, ultimaCompra:'2026-04-17', segmento:'Nuevo'    },
]
