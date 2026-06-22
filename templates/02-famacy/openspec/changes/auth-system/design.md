# Design: Auth System (Simulated)

## Technical Approach

Implementar autenticación simulada con Zustand + localStorage para persistencia de sesión, RBAC con tres roles, y UI adaptativa en sidebar/dashboard. El estado vive en un store Zustand con middleware `persist`, sin backend real.

## Architecture Decisions

### Decision: Session Persistence Strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Zustand persist + localStorage | XSS risk, readable in devtools, pero suficiente para simulación | **Chosen** - Alineado con stack actual |
| Context API + localStorage | Más boilerplate, re-renders, no devtools | Rejected - Zustand ya está en el proyecto |
| react-query + localStorage | Overkill para estado de auth simulado | Rejected - Complejidad innecesaria |

**Rationale**: Zustand ya está instalado y en uso (`usePharmacyStore.ts`). El middleware `persist` con `createJSONStorage` maneja localStorage automáticamente. Para simulación, la seguridad de producción no es requisito.

### Decision: ProtectedRoute Implementation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Componente wrapper con role check | Claro, declarativo, fácil de leer | **Chosen** - Patrón estándar RR v7 |
| HOC con `withAuth` | Más boilerplate, menos idiomático | Rejected - No necesario |
| Render props en Route | Menos común en RR v7 | Rejected - No idiomático |

**Rationale**: React Router v7 mantiene compatibilidad con v6. Un componente `ProtectedRoute` que lee del store y hace redirect es simple y efectivo.

## Data Flow

```
LoginPage/RegisterPage ──→ useAuthStore (login/register)
         │                           │
         ↓                           ↓
   Zustand persist ──→ localStorage (auth-storage)
         │                           │
         ↓                           ↓
   ProtectedRoute ←── isAuthenticated, user.role
         │
         └──→ Dashboard / Profile / UserManagement
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `dashboard-farmacia/src/types/auth.ts` | Create | Interfaces: User, Role, AuthState |
| `dashboard-farmacia/src/store/useAuthStore.ts` | Create | Zustand store con persist, mockUsers, acciones CRUD |
| `dashboard-farmacia/src/components/ProtectedRoute.tsx` | Create | Guard de rutas con role check |
| `dashboard-farmacia/src/pages/LoginPage.tsx` | Create | Form email/password, usa `login()` del store |
| `dashboard-farmacia/src/pages/RegisterPage.tsx` | Create | Form registro, acceso público |
| `dashboard-farmacia/src/pages/ProfilePage.tsx` | Create | Ver/editar perfil propio, cambio password |
| `dashboard-farmacia/src/pages/UserManagementPage.tsx` | Create | Tabla CRUD usuarios, solo admin |
| `dashboard-farmacia/src/routes/index.tsx` | Modify | Agregar rutas `/login`, `/register`, `/perfil`, `/usuarios` con ProtectedRoute |
| `dashboard-farmacia/src/components/Sidebar.tsx` | Modify | Leer useAuthStore, filtrar ítems por rol, links Perfil/Usuarios |
| `dashboard-farmacia/src/index.css` | Modify | Estilos para formularios auth y tabla usuarios |

## Interfaces / Contracts

```typescript
// types/auth.ts

export type Role = 'admin' | 'staff' | 'customer'

export interface User {
  id: string
  name: string
  email: string
  password: string // mock - plain text para simulación
  role: Role
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  register: (email: string, password: string, name: string, role?: Role) => boolean
  logout: () => void
  addUser: (user: Omit<User, 'id'>) => void
  deleteUser: (id: string) => void
  updateProfile: (id: string, data: Partial<Pick<User, 'name' | 'password'>>) => void
}
```

```typescript
// store/useAuthStore.ts (esqueleto)

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const mockUsers: User[] = [
  { id: '1', name: 'Admin', email: 'admin@stockmolt.com', password: 'admin123', role: 'admin' },
  { id: '2', name: 'Staff User', email: 'staff@stockmolt.com', password: 'staff123', role: 'staff' },
  { id: '3', name: 'Customer User', email: 'customer@stockmolt.com', password: 'cust123', role: 'customer' },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (email, password) => {
        const user = mockUsers.find(u => u.email === email)
        if (!user || password.trim() === '') return false
        set({ user, isAuthenticated: true })
        return true
      },
      register: (email, password, name, role = 'customer') => {
        if (mockUsers.find(u => u.email === email)) return false
        const newUser: User = { id: Date.now().toString(), name, email, password, role }
        mockUsers.push(newUser)
        set({ user: newUser, isAuthenticated: true })
        return true
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      addUser: (userData) => {
        const newUser: User = { ...userData, id: Date.now().toString() }
        mockUsers.push(newUser)
      },
      deleteUser: (id) => {
        const admins = mockUsers.filter(u => u.role === 'admin')
        if (admins.length === 1 && admins[0].id === id) return // No borrar último admin
        const index = mockUsers.findIndex(u => u.id === id)
        if (index > -1) mockUsers.splice(index, 1)
      },
      updateProfile: (id, data) => {
        const user = mockUsers.find(u => u.id === id)
        if (user) Object.assign(user, data)
        const currentUser = get().user
        if (currentUser?.id === id) set({ user: { ...currentUser, ...data } })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Auth store actions (login, register, logout) | Vitest + Zustand patterns |
| Unit | ProtectedRoute renders correct component or redirects | React Testing Library |
| Integration | Flujo login → redirect → sidebar render | RTL + Mock localStorage |
| E2E | *Pending* | *No configurado en el proyecto actual* |

## Migration / Rollout

No migration required. Todo el estado es local (localStorage). Si se quisiera limpiar: `localStorage.removeItem('auth-storage')`.

## Open Questions

- [ ] ¿El registro público debe estar habilitado o solo admin puede crear usuarios? (Diseñado como público según proposal)
- [ ] ¿Dónde exactamente en el header poner la info del usuario? (Propuesta: debajo del logo en sidebar)

---

**UI/UX - Sidebar Adaptation**:

```typescript
// Sidebar.tsx modification (esqueleto)

import { useAuthStore } from '../store/useAuthStore'
import { User } from 'lucide-react'

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore()
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'customer'] },
    { path: '/usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
  ]
  
  const filteredItems = menuItems.filter(item => 
    !user || item.roles.includes(user.role)
  )
  
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Pill size={28} color="var(--color-primary)" />
        <h2>Farmacia Stock</h2>
      </div>
      {user && (
        <div className="user-info">
          <User size={16} />
          <span>{user.name} ({user.role})</span>
        </div>
      )}
      <nav className="sidebar-nav">
        {filteredItems.map(item => (
          <Link key={item.path} to={item.path}>
            <item.icon />
            <span>{item.label}</span>
          </Link>
        ))}
        {user && (
          <Link to="/perfil">
            <User />
            <span>Perfil</span>
          </Link>
        )}
      </nav>
    </aside>
  )
}
```
