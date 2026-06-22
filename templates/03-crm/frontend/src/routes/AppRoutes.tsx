import { Route, Routes, Navigate } from 'react-router-dom'
import App from '@/App'
import Dashboard from '@/pages/Dashboard'
import Pipeline from '@/pages/Pipeline'
import Contacts from '@/pages/Contacts'
import Tasks from '@/pages/Tasks'
import Emails from '@/pages/Emails'
import Calendar from '@/pages/Calendar'
import Reports from '@/pages/Reports'
import Automations from '@/pages/Automations'
import Team from '@/pages/Team'
import Products from '@/pages/Products'
import Documents from '@/pages/Documents'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'
import { Login, Register } from '@/pages/auth'
import { useAuthStore } from '@/store/useAuthStore'

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  return <>{children}</>
}

// Auth route wrapper (redirect if already logged in)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes - No sidebar */}
      <Route
        path="/auth/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/auth/register"
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        }
      />

      {/* Protected Routes - With sidebar */}
      <Route
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      >
        {/* PRINCIPAL */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/pipeline/:dealId" element={<Pipeline />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/contacts/:contactId" element={<Contacts />} />
        <Route path="/tasks" element={<Tasks />} />

        {/* VENTAS */}
        <Route path="/products" element={<Products />} />
        <Route path="/documents" element={<Documents />} />

        {/* COMUNICACIÓN */}
        <Route path="/emails" element={<Emails />} />
        <Route path="/emails/:emailId" element={<Emails />} />
        <Route path="/calendar" element={<Calendar />} />

        {/* ANÁLISIS */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/automations" element={<Automations />} />

        {/* CONFIGURACIÓN */}
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}