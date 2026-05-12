import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { DashboardPage } from '../pages/DashboardPage'
import { InventarioPage } from '../pages/InventarioPage'
import { VentasPage } from '../pages/VentasPage'
import { ClientesPage } from '../pages/ClientesPage'
import { ReportesPage } from '../pages/ReportesPage'
import { ProveedoresPage } from '../pages/ProveedoresPage'
import { LaboratoriosPage } from '../pages/LaboratoriosPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ProfilePage } from '../pages/ProfilePage'
import { UserManagementPage } from '../pages/UserManagementPage'
import { useAuthStore } from '../store/useAuthStore'

// Component to conditionally render Sidebar
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <div className="app-layout">
      {isAuthenticated && <Sidebar />}
      <main className={isAuthenticated ? "main-content" : "main-content full-width"}>
        {children}
      </main>
    </div>
  )
}

// Redirect authenticated users away from login/register
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/inventario" element={
          <ProtectedRoute>
            <Layout>
              <InventarioPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/ventas" element={
          <ProtectedRoute>
            <Layout>
              <VentasPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/clientes" element={
          <ProtectedRoute>
            <Layout>
              <ClientesPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reportes" element={
          <ProtectedRoute>
            <Layout>
              <ReportesPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/proveedores" element={
          <ProtectedRoute>
            <Layout>
              <ProveedoresPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/laboratorios" element={
          <ProtectedRoute>
            <Layout>
              <LaboratoriosPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/usuarios" element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <UserManagementPage />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
