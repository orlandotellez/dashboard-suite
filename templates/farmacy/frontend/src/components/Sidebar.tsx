import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Pill,
  Truck,
  FlaskConical,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { Role } from '../types/auth'
import { useState } from 'react'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
  { path: '/inventario', label: 'Inventario', icon: Package, roles: ['admin', 'staff'] },
  { path: '/ventas', label: 'Ventas', icon: ShoppingCart, roles: ['admin', 'staff'] },
  { path: '/clientes', label: 'Clientes', icon: Users, roles: ['admin', 'staff'] },
  { path: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['admin', 'staff'] },
  { path: '/laboratorios', label: 'Laboratorios', icon: FlaskConical, roles: ['admin', 'staff'] },
  { path: '/reportes', label: 'Reportes', icon: FileText, roles: ['admin', 'staff'] },
  { path: '/usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
]

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'staff': return 'Personal'
      default: return role
      default: return role
    }
  }

  const filteredItems = menuItems.filter(item =>
    !user || item.roles.includes(user.role as Role)
  )

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Pill size={28} color="var(--color-primary)" />
        <h2>Farmacia Stock</h2>
      </div>

      {user && (
        <div className="sidebar-user-info">
          <User size={16} />
          <span className="user-name">{user.name}</span>
          <span className={`role-badge role-${user.role}`}>
            {getRoleLabel(user.role)}
          </span>
        </div>
      )}

      <nav className="sidebar-nav">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <User size={18} />
            <span>Perfil</span>
            {showUserMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showUserMenu && (
            <div className="user-menu">
              <Link to="/perfil" className="user-menu-item">
                <User size={16} />
                <span>Mi Perfil</span>
              </Link>
              <button onClick={logout} className="user-menu-item logout-btn">
                <User size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
