import React from 'react'
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi'
import { useCart } from '../../context/CartContext.jsx'

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart()

  // Soporte para productos con images[] (Tienda) y con img (home)
  const image = item.images ? item.images[0] : item.img

  const unitPrice =
    item.discount > 0
      ? item.price * (1 - item.discount / 100)
      : item.price

  const subtotal = (unitPrice * item.quantity).toFixed(2)

  return (
    <div className="flex gap-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm
                    hover:shadow-md transition-shadow duration-200 p-4">
      {/* Imagen */}
      <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info principal */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-snug line-clamp-2">
          {item.title}
        </h3>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-primary font-bold">
            ${parseFloat(unitPrice).toFixed(2)}
          </span>
          {item.discount > 0 && (
            <span className="text-gray-400 line-through text-xs">
              ${item.price}
            </span>
          )}
          <span className="text-xs text-gray-400">c/u</span>
        </div>

        {/* Controles de cantidad */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-full overflow-hidden">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center
                         hover:bg-gray-100 dark:hover:bg-gray-700
                         text-gray-600 dark:text-gray-300 transition-colors duration-150"
              aria-label="Disminuir cantidad"
            >
              <FiMinus size={12} />
            </button>
            <span className="w-8 text-center text-sm font-semibold
                             text-gray-800 dark:text-white select-none">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center
                         hover:bg-gray-100 dark:hover:bg-gray-700
                         text-gray-600 dark:text-gray-300 transition-colors duration-150"
              aria-label="Aumentar cantidad"
            >
              <FiPlus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Subtotal + eliminar */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-gray-400 hover:text-red-500 transition-colors duration-150 p-1"
          aria-label="Eliminar producto"
        >
          <FiTrash2 size={16} />
        </button>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-0.5">Subtotal</p>
          <p className="font-bold text-gray-800 dark:text-white text-sm">
            ${subtotal}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CartItem
