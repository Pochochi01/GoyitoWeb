import api from '../axios'

const addressService = {
  async getAll()          { const { data } = await api.get('/addresses');                  return data },
  async create(payload)   { const { data } = await api.post('/addresses', payload);        return data },
  async update(id, payload){ const { data } = await api.patch(`/addresses/${id}`, payload); return data },
  async remove(id)        { const { data } = await api.delete(`/addresses/${id}`);         return data },
  async setPrincipal(id)  { const { data } = await api.patch(`/addresses/${id}/principal`); return data },
}

export default addressService
