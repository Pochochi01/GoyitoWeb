import api from '../axios'

const settingsService = {
  async getAll()        { const { data } = await api.get('/settings');         return data },
  async update(payload) { const { data } = await api.put('/settings', payload); return data },
}

export default settingsService
