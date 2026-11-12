import React, { useState } from 'react'
import { FaCartShopping } from 'react-icons/fa6'
import { useCart } from '../../context/CartContext.jsx'
import ProductImage from '../Shared/ProductImage.jsx'
import { TiltCard, Reveal } from '../Motion/motion.jsx'

const ProductCard = ({ data }) => {
  return (
    <div className='mb-10'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5'>
        {data.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.06} className='h-full'>
            <ProductCardItem item={item} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

const ProductCardItem = ({ item }) => {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    // Preservar el descuento real del producto si viene (productos reales de API)
    addToCart({ ...item, discount: item.discount ?? 0 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const finalPrice = item.discount > 0 ? Math.round(item.price * (1 - item.discount / 100)) : null

  return (
    <TiltCard max={7} lift={0} className='h-full'>
      <div className='group h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-800
                      ring-1 ring-black/5 dark:ring-white/5 shadow-sm hover:shadow-xl transition-shadow duration-300 ease-out-expo'>
        <ProductImage src={item.img} alt={item.title}
          imgClassName='[@media(hover:hover)]:group-hover:scale-[1.04]'>
          {item.discount > 0 && (
            <span className='absolute top-2.5 left-2.5 bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm'>
              -{item.discount}%
            </span>
          )}
        </ProductImage>
        <div className='flex flex-col flex-1 gap-1 p-3 sm:p-4'>
          <h3 className='font-semibold text-sm sm:text-base leading-snug line-clamp-2 text-gray-800 dark:text-white'>{item.title}</h3>
          <div className='flex items-baseline gap-2 mt-auto pt-1'>
            <span className={`font-bold tabular-nums ${finalPrice ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>${finalPrice ?? item.price}</span>
            {finalPrice && <span className='text-xs text-gray-400 line-through tabular-nums'>${item.price}</span>}
          </div>
          {/* Visible siempre: en táctil no existe hover */}
          <button
            onClick={handleAdd}
            className={`mt-2 inline-flex items-center justify-center gap-2 w-full min-h-[44px] rounded-full text-sm font-semibold text-white
                        transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]
                        ${added ? 'bg-brandGreen' : 'bg-primary hover:bg-red-600'}`}
          >
            <FaCartShopping className='text-xs'/>
            <span className='truncate'>{added ? '¡Agregado!' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </TiltCard>
  )
}

export default ProductCard
