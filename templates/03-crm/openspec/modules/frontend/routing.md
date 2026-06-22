# Routing - Navegación y Rutas

## src/routes/NavItems.ts

```typescript
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
} from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  group: 'PRINCIPAL' | 'VENTAS' | 'COMUNICACIÓN' | 'ANÁLISIS' | 'CONFIGURACIÓN';
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
];

export const getNavGroups = () => {
  const groups = navItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return Object.entries(groups).map(([group, items]) => ({
    label: group,
    items,
  }));
};
```

---

## src/routes/AppRoutes.tsx

```typescript
import { Route, Routes } from 'react-router-dom';
import App from '@/App';

// Pages
import Dashboard from '@/pages/Dashboard';
import Pipeline from '@/pages/Pipeline';
import Contacts from '@/pages/Contacts';
import Tasks from '@/pages/Tasks';
import Emails from '@/pages/Emails';
import Calendar from '@/pages/Calendar';
import Reports from '@/pages/Reports';
import Automations from '@/pages/Automations';
import Team from '@/pages/Team';
import Products from '@/pages/Products';
import Documents from '@/pages/Documents';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<App />}>
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
        <Route path="/calendar/:eventId" element={<Calendar />} />

        {/* ANÁLISIS */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/automations" element={<Automations />} />

        {/* CONFIGURACIÓN */}
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
```

---

## src/App.tsx

```typescript
import { Outlet } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';

function App() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export default App;
```

---

## src/main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ThemeWrapper } from './ThemeWrapper';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeWrapper>
        <AppRoutes />
      </ThemeWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
```