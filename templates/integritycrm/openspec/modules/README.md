# IntegrityCRM - Spec-Driven Development

## Índice de Módulos

Este documento contiene la especificación completa del proyecto IntegrityCRM organizada por módulos.

---

## Backend

| Archivo | Descripción |
|---------|--------------|
| `rbac.md` | Sistema de control de acceso basado en roles |
| `auth.md` | Autenticación y gestión de sesión |
| `database.md` | Entidades y modelos de datos |
| `mockdata.md` | Datos de ejemplo para inicializar |

---

## Frontend

| Archivo | Descripción |
|---------|--------------|
| `state.md` | Zustand stores para gestión de estado |
| `components.md` | Biblioteca de componentes UI |
| `routing.md` | Sistema de navegación hash-based |
| `forms.md` | Formularios y validaciones |
| `charts.md` | Gráficos con Recharts |
| `dragdrop.md` | Drag & drop para pipeline Kanban |
| `notifications.md` | Panel de notificaciones slide-in |
| `commandpalette.md` | Buscador global ⌘K |
| `emptystates.md` | Estados vacíos por módulo |
| `toasts.md` | Notificaciones temporales |
| `responsive.md` | Diseño adaptativo |

---

## Resumen del Proyecto

### Stack

- **Framework**: React 18
- **Estado**: Zustand
- **Charts**: Recharts
- **Icons**: Tabler Icons
- **Routing**: Hash-based
- **Styling**: CSS puro (sin frameworks)

### Módulos del CRM

1. **Dashboard** - KPIs, charts, actividad
2. **Pipeline** - Kanban drag & drop
3. **Contactos** - CRUD completo
4. **Tareas** - Lista + Kanban
5. **Correos** - 3-panel email
6. **Calendario** - Mes/Semana/Día/Agenda
7. **Reportes** - Analytics y charts
8. **Automatizaciones** - Builder visual
9. **Equipo** - Gestión de miembros
10. **Productos** - Catálogo
11. **Documentos** - Editor de propuestas

### Colores

- Background: #F9FAFB
- Sidebar: #FFFFFF
- Primary: #2563EB (electric blue)
- Success: #16A34A
- Warning: #D97706
- Danger: #DC2626
- Purple: #7C3AED

### Tipografía

- UI: Inter (300, 400, 500, 600)
- Numbers: Inter con tabular-nums

---

## Siguiente Paso

Para comenzar a implementar, ver `global-instuctions.md` con la especificación visual completa.

---

## Notas

- Todos los módulos son independientes
- Backend simulado (sin API real)
- Frontend desktop-first
- ~11 módulos principales