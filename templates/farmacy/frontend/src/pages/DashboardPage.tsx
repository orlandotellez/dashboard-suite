import React from 'react'
import { usePharmacyStore } from '../store/usePharmacyStore'
import { useAuthStore } from '../store/useAuthStore'
import { DollarSign, Package, Archive, Users, LogOut } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { MedicineTable } from '../components/MedicineTable'
import { InventoryAlerts } from '../components/InventoryAlerts'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Datos de ejemplo para el gráfico
const salesData = [
  { name: 'Lun', ventas: 400 },
  { name: 'Mar', ventas: 300 },
  { name: 'Mié', ventas: 500 },
  { name: 'Jue', ventas: 280 },
  { name: 'Vie', ventas: 590 },
  { name: 'Sáb', ventas: 800 },
  { name: 'Dom', ventas: 450 },
]

export const DashboardPage: React.FC = () => {
  const { stats } = usePharmacyStore()
  const { user, logout } = useAuthStore()

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'staff': return 'Personal'
      default: return role
    }
  }

  return (
    <div>
      <div className="content-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen general de la farmacia - {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {user && (
          <div className="user-welcome">
            <div className="welcome-info">
              <span className="welcome-text">Bienvenido, <strong>{user.name}</strong></span>
              <span className={`role-badge role-${user.role}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
            <button className="btn btn-secondary btn-logout" onClick={logout}>
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>

      {/* Métricas Clave */}
      <div className="stats-grid">
        <StatCard
          title="Ventas del Día"
          value={`$${stats.dailySales.toFixed(2)}`}
          icon={DollarSign}
          colorClass="sales"
        />
        <StatCard
          title="Productos en Inventario"
          value={stats.totalProducts.toString()}
          icon={Package}
          colorClass="products"
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStock.length.toString()}
          icon={Archive}
          colorClass="inventory"
        />
        <StatCard
          title="Clientes Atendidos"
          value={stats.totalClients.toString()}
          icon={Users}
          colorClass="clients"
        />
      </div>

      {/* Gráfico de Ventas */}
      <div className="content-section">
        <div className="section-header">
          <h2>Ventas Semanales</h2>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="ventas" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Productos más vendidos */}
      <div className="content-section">
        <div className="section-header">
          <h2>Productos Más Vendidos</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {stats.topSelling.map((med, index) => (
            <div key={med.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: 'var(--color-bg)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  {index + 1}
                </span>
                <span style={{ fontWeight: 500 }}>{med.name}</span>
              </div>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                ${med.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      <InventoryAlerts />

      {/* Tabla de Medicamentos */}
      <MedicineTable />
    </div>
  )
}
