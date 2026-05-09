import React, { useRef } from 'react'
import { FiPrinter, FiX, FiCheckCircle } from 'react-icons/fi'

const EMPRESA = "ZolImportados"

/**
 * POSReceipt — modal de comprobante imprimible.
 * Props: sale (objeto venta completa con items), onClose, onNewSale
 */
export default function POSReceipt({ sale, onClose, onNewSale }) {
  const printRef = useRef()

  const handlePrint = () => {
    const content = printRef.current.innerHTML
    const w = window.open('', '_blank', 'width=400,height=600')
    w.document.write(`
      <html><head><title>Comprobante #${sale.id}</title>
      <style>
        body { font-family: monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 10px; }
        h2 { text-align: center; margin: 4px 0; font-size: 16px; }
        p  { margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        td, th { padding: 2px 4px; text-align: left; font-size: 11px; }
        .right { text-align: right; }
        .separator { border-top: 1px dashed #000; margin: 6px 0; }
        .total { font-size: 14px; font-weight: bold; }
        .center { text-align: center; }
      </style></head><body>${content}</body></html>
    `)
    w.document.close()
    w.focus()
    w.print()
    w.close()
  }

  const handleWhatsApp = () => {
    const lines = [
      `*${EMPRESA} — Comprobante #${sale.id}*`,
      `Fecha: ${sale.fecha}`,
      sale.sucursal_nombre ? `Sucursal: ${sale.sucursal_nombre}` : '',
      '',
      '*Detalle:*',
      ...sale.items.map(i =>
        `• ${i.titulo || i.nombre_producto} x${i.cantidad} = $${Number(i.subtotal).toLocaleString()}`
      ),
      '',
      `*Total: $${Number(sale.total).toLocaleString()}*`,
      `Pago: ${sale.metodo_pago}`,
      '',
      'Gracias por su compra 🛍️',
    ].filter(Boolean).join('\n')

    const phone = sale.cliente_email ? '' : ''
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lines)}`, '_blank')
  }

  const fecha = sale.fecha
  const items = sale.items || []
  const subtotalSinDesc = items.reduce((s, i) => s + Number(i.subtotal), 0)
  const descuento = sale.descuento || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-green-600">
            <FiCheckCircle size={20}/>
            <span className="font-bold text-sm">Venta registrada</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20}/></button>
        </div>

        {/* Ticket printable area */}
        <div ref={printRef} className="p-4 font-mono text-xs text-gray-800 dark:text-gray-100">
          <h2 className="text-base font-bold text-center">{EMPRESA}</h2>
          {sale.sucursal_nombre && (
            <p className="text-center text-gray-500">{sale.sucursal_nombre}</p>
          )}
          {sale.sucursal_direccion && (
            <p className="text-center text-gray-400">{sale.sucursal_direccion}</p>
          )}

          <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2"/>

          <p>Comprobante Nº <strong>#{sale.id}</strong></p>
          <p>Fecha: {fecha}</p>
          {sale.operador_nombre && <p>Operador: {sale.operador_nombre}</p>}
          {sale.cliente_nombre  && <p>Cliente: {sale.cliente_nombre}</p>}

          <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2"/>

          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-0.5">Producto</th>
                <th className="text-center">Cant</th>
                <th className="text-right">Precio</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="py-1 pr-2 leading-tight">{it.titulo || it.nombre_producto}</td>
                  <td className="text-center">{it.cantidad}</td>
                  <td className="text-right">${Number(it.precio_unit).toLocaleString()}</td>
                  <td className="text-right font-semibold">${Number(it.subtotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2"/>

          <div className="flex justify-between"><span>Subtotal</span><span>${subtotalSinDesc.toLocaleString()}</span></div>
          {descuento > 0 && (
            <div className="flex justify-between text-orange-500">
              <span>Descuento {descuento}%</span>
              <span>-${(subtotalSinDesc * descuento / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm mt-1">
            <span>TOTAL</span>
            <span>${Number(sale.total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500 mt-0.5">
            <span>Pago</span><span>{sale.metodo_pago}</span>
          </div>

          <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2"/>
          <p className="text-center text-gray-500">¡Gracias por su compra!</p>
        </div>

        {/* Actions */}
        <div className="p-4 flex flex-col gap-2 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <FiPrinter size={15}/> Imprimir
            </button>
            <button onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </button>
          </div>
          <button onClick={onNewSale}
            className="w-full py-3 rounded-xl bg-primary hover:bg-red-600 text-white font-bold text-sm transition-colors">
            Nueva venta
          </button>
        </div>
      </div>
    </div>
  )
}
