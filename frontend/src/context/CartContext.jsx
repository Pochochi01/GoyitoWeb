import React, { createContext, useContext, useState, useEffect } from 'react'
import cartService from '../api/services/cartService'

const CartContext = createContext(null)

const calcPrice = (item) =>
  item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('goyito_cart')) || [] } catch { return [] }
  })

  // Sincroniza localStorage en cada cambio
  useEffect(() => {
    localStorage.setItem('goyito_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    // Sincroniza con backend (usuario logueado)
    const token = localStorage.getItem('goyito_token')
    if (token) cartService.addItem(product.id, 1).catch(() => {})
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
    const token = localStorage.getItem('goyito_token')
    if (token) cartService.removeItem(id).catch(() => {})
  }

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return removeFromCart(id)
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i))
    const token = localStorage.getItem('goyito_token')
    if (token) cartService.updateItem(id, quantity).catch(() => {})
  }

  const clearCart = () => {
    setCart([])
    const token = localStorage.getItem('goyito_token')
    if (token) cartService.clearCart().catch(() => {})
  }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const cartTotal = cart.reduce((s, i) => s + calcPrice(i) * i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
