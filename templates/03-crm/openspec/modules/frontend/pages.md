# Pages - Ejemplos de Páginas

## src/pages/Dashboard.tsx

```typescript
import { Users, Target, DollarSign, Percent, CheckSquare, Mail } from 'lucide-react';
import { MetricCard } from '@/components/global/dashboard/MetricCard';
import { SalesChart } from '@/components/global/dashboard/SalesChart';
import { PipelineChart } from '@/components/global/dashboard/PipelineChart';
import { ActivityFeed } from '@/components/global/dashboard/ActivityFeed';
import { TaskList } from '@/components/global/dashboard/TaskList';
import { Leaderboard } from '@/components/global/dashboard/Leaderboard';
import styles from './Dashboard.module.css';

// Mock data
const kpiData = [
  { title: 'Clientes activos', value: '124', change: '+12%', changeType: 'positive', icon: Users },
  { title: 'Oportunidades abiertas', value: '38', change: '+5%', changeType: 'positive', icon: Target },
  { title: 'Valor pipeline', value: '$1.2M', change: '-3%', changeType: 'negative', icon: DollarSign },
  { title: 'Tasa conversión', value: '24.3%', change: '+2.1%', changeType: 'positive', icon: Percent },
  { title: 'Tareas pendientes', value: '12', change: 'hoy', changeType: 'neutral', icon: CheckSquare },
  { title: 'Sin responder', value: '5', change: 'urgente', changeType: 'negative', icon: Mail },
];

const salesData = [
  { month: 'Nov', won: 145000, target: 150000 },
  { month: 'Dic', won: 185000, target: 175000 },
  { month: 'Ene', won: 120000, target: 160000 },
  { month: 'Feb', won: 210000, target: 180000 },
  { month: 'Mar', won: 195000, target: 190000 },
  { month: 'Abr', won: 165000, target: 200000 },
];

const pipelineData = [
  { stage: 'Prospecto', value: 245000, count: 12, color: '#6B7280' },
  { stage: 'Contactado', value: 320000, count: 8, color: '#2563EB' },
  { stage: 'Propuesta', value: 185000, count: 5, color: '#D97706' },
  { stage: 'Negociación', value: 275000, count: 4, color: '#7C3AED' },
  { stage: 'Ganado', value: 195000, count: 5, color: '#16A34A' },
];

const activities = [
  { id: '1', type: 'contact_created' as const, description: 'Nuevo contacto: TechCorp', time: 'hace 5 min' },
  { id: '2', type: 'deal_updated' as const, description: 'Global Ventures → Negociación', time: 'hace 1 hora' },
  { id: '3', type: 'task_completed' as const, description: 'Llamada con Ana completada', time: 'hace 2 horas' },
  { id: '4', type: 'email_sent' as const, description: 'Propuesta enviada a DataPro', time: 'hace 3 horas' },
  { id: '5', type: 'deal_won' as const, description: 'TechCorp cerrado - $85K', time: 'ayer' },
];

const tasks = [
  { id: '1', title: 'Llamar a TechCorp', completed: false, priority: 'alta' as const },
  { id: '2', title: 'Revisar propuesta Global', completed: false, priority: 'media' as const },
  { id: '3', title: 'Enviar seguimiento', completed: true, priority: 'baja' as const },
  { id: '4', title: 'Actualizar pipeline', completed: false, priority: 'media' as const },
];

const leaderboardMembers = [
  { rank: 1, name: 'Ana García', deals: 12, revenue: 280000, progress: 98 },
  { rank: 2, name: 'Carlos López', deals: 10, revenue: 220000, progress: 85 },
  { rank: 3, name: 'María Santos', deals: 8, revenue: 185000, progress: 72 },
  { rank: 4, name: 'Pedro Ruiz', deals: 6, revenue: 145000, progress: 60 },
  { rank: 5, name: 'Laura Chen', deals: 5, revenue: 120000, progress: 52 },
];

export default function Dashboard() {
  return (
    <div className={styles.container}>
      {/* Row 1 - KPIs */}
      <section className={styles.kpiGrid}>
        {kpiData.map((kpi, index) => (
          <MetricCard key={index} {...kpi} />
        ))}
      </section>

      {/* Row 2 - Charts */}
      <section className={styles.chartRow}>
        <div className={styles.chartLarge}>
          <SalesChart data={salesData} />
        </div>
        <div className={styles.chartSmall}>
          <PipelineChart data={pipelineData} />
        </div>
      </section>

      {/* Row 3 - Panels */}
      <section className={styles.panelsRow}>
        <div className={styles.panel}>
          <ActivityFeed activities={activities} />
        </div>
        <div className={styles.panel}>
          <TaskList tasks={tasks} onToggle={() => {}} />
        </div>
        <div className={styles.panel}>
          <Leaderboard members={leaderboardMembers} />
        </div>
      </section>
    </div>
  );
}
```

---

## src/pages/Dashboard.module.css

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* KPI Grid - 6 columns */
.kpiGrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

@media (max-width: 1400px) {
  .kpiGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .kpiGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Chart Row - 8/4 split */
.chartRow {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.chartLarge,
.chartSmall {
  background: white;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 20px;
}

@media (max-width: 1024px) {
  .chartRow {
    grid-template-columns: 1fr;
  }
}

/* Panels Row - 4/4/4 */
.panelsRow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.panel {
  background: white;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 20px;
}

@media (max-width: 1024px) {
  .panelsRow {
    grid-template-columns: 1fr;
  }
}
```

---

## src/pages/Pipeline.tsx (Kanban)

```typescript
import { useState } from 'react';
import { useDealsStore } from '@/store/useDealsStore';
import { DealCard } from '@/components/global/deals/DealCard';
import { DealPanel } from '@/components/global/deals/DealPanel';
import styles from './Pipeline.module.css';

const stages = [
  { id: 'PROSPECTO', label: 'Prospecto', color: '#6B7280' },
  { id: 'CONTACTADO', label: 'Contactado', color: '#2563EB' },
  { id: 'PROPUESTA', label: 'Propuesta', color: '#D97706' },
  { id: 'NEGOCIACION', label: 'Negociación', color: '#7C3AED' },
  { id: 'GANADO', label: 'Ganado', color: '#16A34A' },
  { id: 'PERDIDO', label: 'Perdido', color: '#DC2626' },
];

export default function Pipeline() {
  const { deals, viewMode, setViewMode, selectedDeal, setSelectedDeal } = useDealsStore();
  const [filters, setFilters] = useState({ search: '', assignee: '', stage: '' });

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    const dealId = e.dataTransfer.getData('dealId');
    // TODO: call API to update stage
  };

  return (
    <div className={styles.container}>
      {/* Pipeline Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Pipeline de ventas</h1>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Buscar oportunidades..."
            className={styles.searchInput}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className={styles.select}
            onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
          >
            <option value="">Todos los responsables</option>
            {/* Options from team */}
          </select>
          <select
            className={styles.select}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
          >
            <option value="">Todas las etapas</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${viewMode === 'kanban' ? styles.active : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            Lista
          </button>
        </div>
        <button className={styles.newButton}>Nueva oportunidad</button>
      </div>

      {/* Kanban Board */}
      <div className={styles.board}>
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage.id}
              className={styles.column}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <span className={styles.stageDot} style={{ backgroundColor: stage.color }} />
                  <span>{stage.label}</span>
                </div>
                <span className={styles.stageCount}>{stageDeals.length}</span>
                <span className={styles.stageValue}>${(totalValue / 1000).toFixed(0)}K</span>
              </div>
              <div className={styles.columnCards}>
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <DealCard deal={deal} />
                  </div>
                ))}
                <button className={styles.addCardButton}>
                  + Agregar oportunidad
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Detail Panel */}
      {selectedDeal && (
        <DealPanel
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
```

---

## Autenticación - Páginas de Login y Register

El sistema de autenticación utiliza cookies httpOnly para almacenar tokens JWT de manera segura.

### Arquitectura

```
src/
├── api/
│   ├── api.ts          # Client HTTP con credentials: include
│   └── auth.ts         # Endpoints de autenticación
├── components/layout/
│   └── AuthLayout.tsx  # Layout sin sidebar para páginas de auth
├── pages/auth/
│   ├── Login.tsx       # Página de inicio de sesión
│   ├── Register.tsx    # Página de registro
│   └── index.ts        # Export barrel
└── store/
    └── useAuthStore.ts # Zustand store con persistencia
```

### Backend - Cookies

El backend debe enviar cookies con las siguientes opciones:

```typescript
// auth.controller.ts
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

// En login/register:
reply.setCookie('accessToken', accessToken, {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60, // 15 minutos
})

reply.setCookie('refreshToken', refreshToken, {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60, // 7 días
})
```

### Rutas Protegidas

```typescript
// AppRoutes.tsx
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />
  return <>{children}</>
}

const AuthRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

// Rutas de auth (sin sidebar)
<Route path="/auth/login" element={<AuthRoute><Login /></AuthRoute>} />
<Route path="/auth/register" element={<AuthRoute><Register /></AuthRoute>} />

// Rutas protegidas (con sidebar)
<Route element={<ProtectedRoute><App /></ProtectedRoute>}>
  <Route path="/" element={<Dashboard />} />
  ...
</Route>
```

### Store de Autenticación

```typescript
// useAuthStore.ts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; name: string }) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}
```

### API Service

```typescript
// api.ts - Client HTTP con cookies
const api = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include', // ← Importante para cookies
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse(response)
  },
  // post, put, delete similar...
}
```

### Variables de Entorno

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000/api/v1

# Backend (.env)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret
```

### Flujo de Autenticación

1. **Login/Register**: Usuario envía credenciales → Backend valida y devuelve tokens en cookies
2. **Sesión**: Token almacenado en cookies httpOnly (no accesible desde JS)
3. **Requests**: Frontend envía cookies automáticamente con cada request (credentials: include)
4. **Logout**: Backend clear cookies → Frontend limpia state y redirige

### Configuración CORS (Backend)

```typescript
// app.ts
await app.register(FastifyCors, {
  origin: true,
  credentials: true, // ← Importante para cookies
})
```

### Modo Demo

El store incluye un flag `DEMO_MODE = true` para desarrollo sin backend real. Cambiar a `false` para usar la API real.