# Proposal: Auth System (Simulated)

## Intent

Implementar autenticación simulada, RBAC y gestión de perfil en el dashboard frontend usando Zustand + localStorage, sin backend.

## Scope

### In Scope
- Auth store simulado con Zustand persist (login, register, logout, mock JWT)
- RBAC con roles `admin`, `staff`, `customer`
- CRUD de usuarios (solo admin) dentro del store
- Página de perfil para ver/editar datos propios
- `ProtectedRoute` para rutas privadas
- Sidebar condicional según rol y estado de auth
- Páginas: Login, Register, Profile, UserManagement

### Out of Scope
- Integración con backend real
- JWT real (firmado/verificado)
- Hash de contraseñas
- Verificación por email
- Seguridad de producción (protección XSS, etc.)

## Capabilities

### New Capabilities
- `user-auth`: Auth simulada con Zustand persist, mock JWT, login/register/logout.
- `role-based-access`: RBAC con tres roles, componente ProtectedRoute.
- `user-management`: CRUD usuarios en Zustand, acceso solo admin.
- `user-profile`: Página de perfil con datos y edición.
- `sidebar-adaptation`: Sidebar filtra ítems por rol, agrega link a Perfil.

### Modified Capabilities
None

## Approach
- **Auth Store**: Zustand + `persist` middleware en localStorage (`auth-storage`). Mock users array dentro del store. Login acepta cualquier password no vacía para demo.
- **Routing**: Envolver rutas privadas con `<ProtectedRoute allowedRoles={[...]}>`. Rutas públicas: `/login`, `/register`. Privadas: `/`, `/perfil`, `/usuarios` (admin).
- **UI**: Sidebar lee store de auth, filtra ítems por rol. Agrega link a Perfil con ícono `User` de lucide-react.
- **Pages**: Crear LoginPage, RegisterPage, ProfilePage, UserManagementPage como componentes funcionales.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `dashboard-farmacia/src/types/auth.ts` | New | Tipos User, Role, AuthState |
| `dashboard-farmacia/src/store/useAuthStore.ts` | New | Zustand store con persist |
| `dashboard-farmacia/src/components/ProtectedRoute.tsx` | New | Guard de rutas |
| `dashboard-farmacia/src/pages/LoginPage.tsx` | New | Formulario login |
| `dashboard-farmacia/src/pages/RegisterPage.tsx` | New | Formulario registro |
| `dashboard-farmacia/src/pages/ProfilePage.tsx` | New | Perfil de usuario |
| `dashboard-farmacia/src/pages/UserManagementPage.tsx` | New | CRUD usuarios (admin) |
| `dashboard-farmacia/src/routes/index.tsx` | Modified | Rutas protegidas y públicas |
| `dashboard-farmacia/src/components/Sidebar.tsx` | Modified | Ítems condicionales, link Perfil |
| `dashboard-farmacia/src/index.css` | Modified | Estilos relacionados |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Cambios API Zustand v5 para persist | Low | Verificar docs; usar createJSONStorage |
| Diferencias React Router v7 | Low | Seguir guía de migración oficial |
| XSS vía localStorage | Medium | Aceptable para simulación; advertir en comentarios |
| Falsa sensación de seguridad | Low | Documentar claramente que es solo demo |

## Rollback Plan
- Eliminar archivos nuevos (`types/auth.ts`, `store/useAuthStore.ts`, `components/ProtectedRoute.tsx`, páginas).
- Revertir cambios en `routes/index.tsx` y `Sidebar.tsx` usando git history.
- Limpiar clave `auth-storage` de localStorage si es necesario.

## Dependencies
- Zustand (ya instalado)
- React Router DOM v7 (ya instalado)
- lucide-react (ya instalado)

## Success Criteria
- [ ] Usuario puede loguearse con credenciales mock y ser redirigido al dashboard.
- [ ] Usuarios no autenticados son redirigidos a `/login` al acceder a rutas protegidas.
- [ ] Admin puede crear, editar, eliminar usuarios vía UserManagement.
- [ ] Sidebar muestra/oculta ítems según rol de usuario.
- [ ] Página de perfil muestra info y permite edición.
- [ ] Estado de auth persiste tras recargar página (localStorage).
