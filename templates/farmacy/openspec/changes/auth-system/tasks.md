# Tasks: Auth System (Simulated)

## Fase 1: Infraestructura

- [x] 1.1 Crear `src/types/auth.ts` con las interfaces (User, Role, AuthState)
- [x] 1.2 Crear `src/store/useAuthStore.ts` usando `zustand` y `persist` middleware con `localStorage`. Incluir mock data de usuarios (admin, staff, customer)

## Fase 2: Componentes Base

- [x] 2.1 Crear `src/components/ProtectedRoute.tsx` que lea el store y redirija si no está autenticado o no tiene el rol

## Fase 3: Páginas

- [x] 3.1 Crear `src/pages/LoginPage.tsx`: Formulario de login (email/password) que use el store
- [x] 3.2 Crear `src/pages/RegisterPage.tsx`: Formulario de registro (público)
- [x] 3.3 Crear `src/pages/ProfilePage.tsx`: Ver info personal, rol, y editar datos básicos
- [x] 3.4 Crear `src/pages/UserManagementPage.tsx`: Tabla CRUD de usuarios (solo admin)

## Fase 4: Integración

- [x] 4.1 Modificar `src/routes/index.tsx`: Agregar rutas `/login`, `/register`, `/perfil`, `/usuarios`. Envolver rutas privadas con `<ProtectedRoute>`
- [x] 4.2 Modificar `src/components/Sidebar.tsx`: Leer `useAuthStore` para mostrar/ocultar items según rol. Agregar link a "Perfil"
- [x] 4.3 Modificar `src/pages/DashboardPage.tsx`: Mostrar información del usuario logueado y botón de logout

## Fase 5: Estilos

- [x] 5.1 Agregar estilos en `src/index.css` para formularios de auth, tabla de usuarios, y perfil

## Verificación

- [x] 6.1 Verificar que el proyecto compile (`pnpm run build`)
- [x] 6.2 Verificar que el store persista datos en localStorage
- [x] 6.3 Verificar que las rutas protegidas funcionen correctamente
