import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: ('admin' | 'staff')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    if (!roles.includes(user.role)) {
      // User doesn't have required role - redirect to home
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
