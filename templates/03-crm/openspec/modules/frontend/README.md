# Frontend - Especificación para IntegrityCRM

## Estructura de Carpetas

```
src/
├── App.tsx                    ← Root component
├── main.tsx                   ← Entry point
├── index.css                  ← Global styles
├── ThemeWrapper.tsx          ← Theme provider
│
├── assets/                    ← Images, fonts, etc.
│
├── components/
│   ├── common/               ← Atoms / Reusable UI
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Badge/
│   │   ├── Modal/
│   │   └── Avatar/
│   │
│   ├── layout/               ← Layout components
│   │   ├── DashboardLayout/
│   │   ├── SideBar/
│   │   └── Header/
│   │
│   └── global/               ← Feature components
│       ├── dashboard/        (MetricCard, SalesChart, etc.)
│       ├── deals/            (DealCard, DealPanel, etc.)
│       ├── contacts/         (ContactTable, ContactCard, etc.)
│       ├── tasks/
│       ├── emails/
│       ├── calendar/
│       ├── products/
│       ├── documents/
│       ├── automations/
│       ├── reports/
│       └── team/
│
├── pages/                    ← Route pages
│   ├── Dashboard.tsx
│   ├── Pipeline.tsx
│   ├── Contacts.tsx
│   ├── Tasks.tsx
│   ├── Emails.tsx
│   ├── Calendar.tsx
│   ├── Reports.tsx
│   ├── Automations.tsx
│   ├── Team.tsx
│   ├── Products.tsx
│   ├── Documents.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
│
├── store/                     ← Zustand stores
│   ├── useAuthStore.ts
│   ├── useSideBarStore.ts
│   ├── useContactsStore.ts
│   ├── useDealsStore.ts
│   ├── useTasksStore.ts
│   ├── useEmailsStore.ts
│   ├── useUIStore.ts
│   └── ...
│
├── routes/                    ← Routing
│   ├── AppRoutes.tsx
│   └── NavItems.ts
│
├── context/                   ← React contexts
│   ├── ThemeContext.tsx
│   └── AuthContext.tsx
│
├── services/                  ← API calls
│   ├── api.ts
│   └── ...
│
├── types/                    ← TypeScript types
│   └── index.ts
│
└── utils/                    ← Helpers
    ├── formatters.ts
    └── constants.ts
```

---

## Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `stack.md` | Dependencias, estructura, config |
| `stores.md` | Zustand stores (auth, sidebar, contacts, deals, UI) |
| `routing.md` | NavItems, AppRoutes, App.tsx, main.tsx |
| `layout.md` | DashboardLayout, SideBar, Header con estilos |
| `components-examples.md` | MetricCard, Charts, ActivityFeed, TaskList, Leaderboard |
| `pages.md` | Dashboard y Pipeline ejemplos |

---

## Patrón de Componentes

Cada componente sigue el patrón:
- Componente en `.tsx`
- Estilos en `.module.css` (mismo directorio)
- Props con TypeScript interfaces

---

## Próximos Pasos

1. Implementar todos los stores necesarios
2. Crear componentes comunes (Button, Input, Badge, etc.)
3. Implementar cada página
4. Agregar integración con API

---

## Stack Confirmado

- React 19 + Vite
- TypeScript
- Zustand (state)
- React Router
- Recharts (charts)
- Lucide Icons
- CSS Modules