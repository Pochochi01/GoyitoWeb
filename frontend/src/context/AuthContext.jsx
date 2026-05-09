import React, { createContext, useContext, useState } from 'react'
import authService from '../api/services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('goyito_user')) } catch { return null }
  })

  const persist = (token, userData) => {
    localStorage.setItem('goyito_token', token)
    localStorage.setItem('goyito_user',  JSON.stringify(userData))
    setUser(userData)
  }

  const login = async (username, password) => {
    try {
      const { token, user: userData } = await authService.login(username, password)
      persist(token, userData)
      return { success: true, user: userData }
    } catch (err) {
      const msg = err.response?.data?.message || 'Usuario o contraseña incorrectos'
      return { success: false, error: msg }
    }
  }

  const register = async (formData) => {
    try {
      const { token, user: userData } = await authService.register(formData)
      persist(token, userData)
      return { success: true, user: userData }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar usuario'
      return { success: false, error: msg }
    }
  }

  const logout = async () => {
    await authService.logout()
    localStorage.removeItem('goyito_token')
    localStorage.removeItem('goyito_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      login, register, logout,
      isAdmin:        user?.role === 'admin',
      isAdminComplejo:user?.role === 'admin_complejo',
      isAnyAdmin:     user?.role === 'admin' || user?.role === 'admin_complejo',
      isPOS:          user?.role === 'pos',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
