import React, { useState } from 'react'
import Button from '../Shared/button.jsx'
import { useCart } from '../../context/CartContext.jsx'

const ProductCard = ({ data }) => {
  return (
    <div className='mb-10'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 place-items-center'>
        {data.map((item) => (
          <ProductCardItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

const ProductCardItem = ({ item }) => {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart({ ...item, discount: 0 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className='group w-full max-w-[260px] mx-auto'>
      <div className='relative space-y-3'>
        <img
          src={item.img}
          alt={item.title}
          className='w-full aspect-[260/180] object-cover rounded-md'
        />
        {/* Overlay táctil: en mobile siempre visible al tocar, en desktop solo hover */}
        <div
          className='hidden group-hover:flex absolute top-1/2 -translate-y-1/2 left-1/2
                     -translate-x-1/2 h-full w-full text-center group-hover:backdrop-blur-sm
                     justify-center items-center duration-200'
        >
          <button
            onClick={handleAdd}
            className={`cursor-pointer hover:scale-105 duration-300 py-2 px-6 sm:px-8 rounded-full
                        relative z-10 font-semibold text-white text-sm sm:text-base
                        min-h-[44px]
                        ${added ? 'bg-green-500' : 'bg-primary'}`}
          >
            {added ? '¡Agregado!' : 'Agregar al Carrito'}
          </button>
        </div>
      </div>
      <div className='leading-7'>
        <h2 className='font-semibold text-base sm:text-lg'>{item.title}</h2>
        <h2 className='font-bold'>${item.price}</h2>
      </div>
    </div>
  )
}

export default ProductCard
