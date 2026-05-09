import api from '../axios'

const cartService = {
  async getCart() {
    const { data } = await api.get('/cart')
    return data
  },

  async addItem(producto_id, cantidad = 1) {
    const { data } = await api.post('/cart', { producto_id, cantidad })
    return data
  },

  async updateItem(producto_id, cantidad) {
    const { data } = await api.patch(`/cart/${producto_id}`, { cantidad })
    return data
  },

  async removeItem(producto_id) {
    const { data } = await api.delete(`/cart/${producto_id}`)
    return data
  },

  async clearCart() {
    const { data } = await api.delete('/cart')
    return data
  },
}

export default cartService
