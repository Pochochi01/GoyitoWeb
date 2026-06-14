import React, { useEffect, useState } from 'react'
import Heading from '../Shared/Heading.jsx'
import ProductCard from './ProductCard.jsx'
import productService from '../../api/services/productService'

/**
 * Sección "Nuestros Productos" de la home.
 * Lee productos reales desde la API (no datos hardcoded), así los items
 * agregados al carrito tienen un producto_id válido en la BD.
 *
 * Estrategia de selección: top 4 activos, priorizando los que están en oferta.
 */
const Products = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getAll({ limit: 20, activo: 1 })
      .then(res => {
        const list = res?.data || []
        // Priorizar productos con descuento, luego completar con el resto.
        const ofertas  = list.filter(p => p.discount > 0)
        const regulares = list.filter(p => p.discount === 0)
        const top = [...ofertas, ...regulares].slice(0, 4)
        // ProductCard espera { id, img, title, price } — mapeamos `images[0]` a `img`.
        setItems(top.map(p => ({
          id:       p.id,
          img:      p.images?.[0] || null,
          title:    p.title,
          price:    p.price,
          discount: p.discount,
          aosDelay: '0',
        })))
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="container">
        <Heading title="Nuestros Productos" subtitle={"Conozca Nuestros Productos"}/>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
          </div>
        ) : items.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">
            No hay productos disponibles en este momento.
          </p>
        ) : (
          <ProductCard data={items}/>
        )}
      </div>
    </div>
  )
}

export default Products
