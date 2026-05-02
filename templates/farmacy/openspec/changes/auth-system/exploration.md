## Exploration: auth-system (Frontend Only - Mock)

### Current State

**Frontend (React 19 + TypeScript + Zustand + React Router 7):**
- **No Auth:** No existe lógica de autenticación. No hay login, no hay token, no hay rutas protegidas.
- **State Management:** Usa Zustand (`usePharmacyStore`, `useVentasStore`, etc.). Los stores actuales usan datos mockeados en memoria (arrays hardcoded). **No usan `persist` middleware aún**.
- **Routing:** React Router DOM v7. Todas las rutas en `routes/index.tsx` son **públicas**. No hay `<ProtectedRoute>`.
- **UI:** Sidebar es estático (array `menuItems` hardcodeado). No hay sección de perfil de usuario.
- **Types:** `types/pharmacy.ts` define tipos de dominio (Medicine, Venta, Cliente, etc.). No hay tipos de usuario.
- **Estilos:** `index.css` tiene variables CSS y clases `.sidebar`, `.sidebar-nav`, `.nav-item`, `.active`, etc.

**Lo que NO existe (y se requiere):**
- Tipos `User`, `Role` (`admin` | `staff` | `customer`)
- `useAuthStore` con Zustand + `persist` middleware
- Páginas `LoginPage`, `RegisterPage`, `ProfilePage`, `UserManagementPage`
- Componente `ProtectedRoute` para React Router
- Mock data de usuarios

### Affected Areas

- `dashboard-farmacia/src/types/pharmacy.ts` — **Extender** o crear `types/auth.ts` con tipos `User`, `Role`, `AuthState`.
- `dashboard-farmacia/src/store/` — **Crear** `useAuthStore.ts` con persistencia en `localStorage` usando `zustand/middleware`.
- `dashboard-farmacia/src/routes/index.tsx` — **Refactorizar** para envolver rutas privadas en `<ProtectedRoute>` y añadir rutas `/login`, `/register`, `/perfil`, `/usuarios`.
- `dashboard-farmacia/src/components/Sidebar.tsx` — **Condicional**: mostrar/ocultar items según rol, añadir enlace a "Perfil" con ícono `User` de `lucide-react`.
- `dashboard-farmacia/src/pages/` — **Crear** nuevas páginas: `LoginPage.tsx`, `RegisterPage.tsx`, `ProfilePage.tsx`, `UserManagementPage.tsx`.
- `dashboard-farmacia/src/App.tsx` o `routes/index.tsx` — **Ajustar** layout para mostrar Sidebar solo cuando está autenticado.

### Approaches

#### 1. **Zustand `persist` middleware para Auth Store**
   - **Descripción:** Usar `create(persist(...))` con `name: 'auth-storage'` en localStorage. El store mantiene `user`, `token` (string fijo `"mock-jwt-token"`), `isAuthenticated`.
   - **Pros:** 
     - Persistencia automática entre recargas de página.
     - API simple de Zustand, sigue el patrón de los otros stores del proyecto.
     - Fácil de "limpiar" con `logout()` (hace `clearStorage()` y `set` a estado inicial).
   - **Cons:** 
     - localStorage es vulnerable a XSS (aceptable para simulación/demo).
     - Zustand v5 puede tener cambios menores en la API de `persist` respecto a v4 (pero es estable).
   - **Effort:** Low
   - **Recomendado:** ✅ SÍ

#### 2. **ProtectedRoute como Componente Wrapper**
   - **Descripción:** Componente que lee `useAuthStore` y verifica `isAuthenticated` + `user.role`. Redirige a `/login` si no está autenticado, o a `/unauthorized` si no tiene el rol.
   - **Pros:** 
     - Declarativo y reutilizable en `routes/index.tsx`.
     - Fácil de leer: `<ProtectedRoute allowedRoles={['admin']} component={<UserManagementPage />} />`.
   - **Cons:** 
     - React Router v7 cambió un poco la API de `Navigate` y `useNavigate` (pero sigue siendo compatible).
     - Aumenta ligeramente la profundidad del árbol de componentes.
   - **Effort:** Low
   - **Recomendado:** ✅ SÍ

#### 3. **Mock Data de Usuarios en el Store**
   - **Descripción:** Array fijo de 3-4 usuarios (admin, staff, customer) dentro del store o en un archivo `mock/users.ts`. El `login(email, password)` itera ese array y compara.
   - **Pros:** 
     - Totalmente simulado, sin backend.
     - Fácil de extender para la gestión de usuarios (CRUD en el mismo store).
   - **Cons:** 
     - Contraseñas hardcodeadas (ej: "admin123").
     - No hay hashing real (aceptable para simulación).
   - **Effort:** Low
   - **Recomendado:** ✅ SÍ

#### 4. **Sidebar Condicional con lucide-react**
   - **Descripción:** El Sidebar lee `useAuthStore` y filtra `menuItems` según rol. Agrega un divider y el link "Perfil" con ícono `User` al final.
   - **Pros:** 
     - `lucide-react` ya está instalado (`^0.575.0`).
     - Ya hay patrón de `menuItems.map()` para renderizar links.
   - **Cons:** 
     - Requiere añadir estado al Sidebar (o pasar props).
     - El diseño actual no tiene sección de "Usuario" arriba o abajo (considerar añadir avatar + nombre en el header del sidebar).
   - **Effort:** Low-Medium
   - **Recomendado:** ✅ SÍ (ver recomendación de ubicación abajo)

### Recommendation

**Para el store (`useAuthStore.ts`):**
```typescript
// Estructura recomendada
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Role = 'admin' | 'staff' | 'customer'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  // datos básicos para perfil
  phone?: string
  address?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  
  login: (email: string, password: string) => boolean
  register: (email: string, password: string, name: string, role?: Role) => boolean
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  
  // Admin CRUD
  users: User[]
  addUser: (user: Omit<User, 'id'> & { password: string }) => void
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
}

// Mock inicial
const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@farmacia.com', name: 'Admin Principal', role: 'admin' },
  { id: '2', email: 'staff@farmacia.com', name: 'Empleado Uno', role: 'staff' },
  { id: '3', email: 'cust@farmacia.com', name: 'Cliente Uno', role: 'customer' },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      users: MOCK_USERS,
      
      login: (email, password) => {
        // Simulación: acepta cualquier password no vacío
        const found = get().users.find(u => u.email === email)
        if (found && password.length > 0) {
          set({ user: found, token: 'mock-jwt-token', isAuthenticated: true })
          return true
        }
        return false
      },
      
      register: (email, password, name, role = 'customer') => {
        const exists = get().users.find(u => u.email === email)
        if (exists) return false
        
        const newUser: User = { id: Date.now().toString(), email, name, role }
        set(state => ({ users: [...state.users, newUser] }))
        return true
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      updateProfile: (data) => {
        set(state => ({
          user: state.user ? { ...state.user, ...data } : null,
          users: state.users.map(u => 
            u.id === state.user?.id ? { ...u, ...data } : u
          )
        }))
      },
      
      addUser: (userData) => { /* ... */ },
      updateUser: (id, data) => { /* ... */ },
      deleteUser: (id) => { /* ... */ },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

**Para el ProtectedRoute:**
```tsx
// components/ProtectedRoute.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

interface Props {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return <>{children}</>
}
```

**Para el Sidebar (dónde poner "Perfil"):**
- **Opción A (Recomendada):** Debajo de las opciones existentes, añadir un divider y luego el link "Perfil" con ícono `User`. Esto sigue el patrón de `menuItems.map()` y es fácil de implementar.
- **Opción B:** Arriba en el `sidebar-header`, junto al título "Farmacia Stock", mostrar avatar y nombre del usuario logueado. Más complejo pero más profesional.
- **Mi recomendación:** **Opción A** para la primera iteración. Se puede mejorar visualmente después.

### Risks

- **Zustand v5 API:** La búsqueda mostró que `persist` sigue igual, pero hay que verificar que `createJSONStorage` esté disponible en v5.0.11 (debería estarlo).
- **React Router v7:** La API de `Navigate` y `useNavigate` cambió ligeramente en v7, pero sigue siendo compatible con v6. Verificar imports.
- **localStorage en SSR:** No aplica porque es un SPA puro de Vite/React, no Next.js.
- **Simulación de contraseñas:** El `login` acepta cualquier contraseña no vacía. Para una demo está bien, pero aclarar que NO es seguro.

### Ready for Proposal

**Yes** — Los requerimientos están claros, el codebase está investigado, y las aproximaciones están definidas.

**Notas para el orchestrator:**
- El usuario fue **muy específico**: TODO SIMULADO, ignorar backend.
- Seguir los patrones existentes: Zustand stores, `lucide-react` para íconos, React Router v7.
- Crear nuevos archivos en las carpetas correctas (`types/`, `store/`, `pages/`, `components/`).
- El `useAuthStore` debe tener TANTO la lógica de auth (login/logout/register) COMO la gestión de usuarios (CRUD) porque el requerimiento dice "solo admin" pero es un solo store simulado.
