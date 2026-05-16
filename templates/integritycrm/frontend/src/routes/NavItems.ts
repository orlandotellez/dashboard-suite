import {
  LayoutDashboard,
  Columns,
  Users,
  CheckSquare,
  Mail,
  Calendar,
  BarChart3,
  Zap,
  UsersRound,
  Package,
  FileText,
  Settings,
} from 'lucide-react'

export interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  path: string
  group: 'PRINCIPAL' | 'VENTAS' | 'COMUNICACIÓN' | 'ANÁLISIS' | 'CONFIGURACIÓN'
}

export const navItems: NavItem[] = [
  // PRINCIPAL
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', group: 'PRINCIPAL' },
  { icon: Columns, label: 'Pipeline', path: '/pipeline', group: 'PRINCIPAL' },
  { icon: Users, label: 'Contactos', path: '/contacts', group: 'PRINCIPAL' },
  { icon: CheckSquare, label: 'Tareas', path: '/tasks', group: 'PRINCIPAL' },

  // VENTAS
  { icon: Package, label: 'Productos', path: '/products', group: 'VENTAS' },
  { icon: FileText, label: 'Documentos', path: '/documents', group: 'VENTAS' },

  // COMUNICACIÓN
  { icon: Mail, label: 'Correos', path: '/emails', group: 'COMUNICACIÓN' },
  { icon: Calendar, label: 'Calendario', path: '/calendar', group: 'COMUNICACIÓN' },

  // ANÁLISIS
  { icon: BarChart3, label: 'Reportes', path: '/reports', group: 'ANÁLISIS' },
  { icon: Zap, label: 'Automatizaciones', path: '/automations', group: 'ANÁLISIS' },

  // CONFIGURACIÓN
  { icon: UsersRound, label: 'Equipo', path: '/team', group: 'CONFIGURACIÓN' },
  { icon: Settings, label: 'Configuración', path: '/settings', group: 'CONFIGURACIÓN' },
]

export const getNavGroups = () => {
  const groups = navItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = []
    }
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, NavItem[]>)

  return Object.entries(groups).map(([group, items]) => ({
    label: group,
    items,
  }))
}