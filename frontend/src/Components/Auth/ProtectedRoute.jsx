import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * ProtectedRoute
 * requiredRole: string | string[]  → uno o varios roles permitidos
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!allowed.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
