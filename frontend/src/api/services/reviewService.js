import api from '../axios'

const reviewService = {
  // ── Comprador ──────────────────────────────────────────────
  async create(payload)     { const { data } = await api.post('/reviews', payload);               return data },
  async getByOrder(ordenId) { const { data } = await api.get(`/reviews/order/${ordenId}`);        return data },

  // ── Admin ──────────────────────────────────────────────────
  async getSummary()           { const { data } = await api.get('/reviews/summary');              return data },
  async getAll(params = {})    { const { data } = await api.get('/reviews', { params });          return data },
  async getPending(params = {}) { const { data } = await api.get('/reviews/pending', { params }); return data },
}

export default reviewService
