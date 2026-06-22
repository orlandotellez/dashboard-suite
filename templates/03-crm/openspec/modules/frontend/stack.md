# Stack - Dependencias y Configuración

## package.json

```json
{
  "name": "integritycrm",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.575.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0",
    "recharts": "^3.7.0",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react-swc": "^4.2.2",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.48.0",
    "vite": "^7.3.1"
  }
}
```

---

## Estructura de Carpetas

```
src/
├── App.tsx                    ← Root component
├── main.tsx                   ← Entry point
├── index.css                  ← Global styles
├── ThemeWrapper.tsx           ← Theme provider
│
├── assets/                    ← Images, fonts, etc.
│
├── components/
│   ├── common/                ← Atoms / Reusable UI
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Badge/
│   │   ├── Modal/
│   │   └── Avatar/
│   │
│   ├── layout/                ← Layout components
│   │   ├── DashboardLayout/
│   │   ├── SideBar/
│   │   └── Header/
│   │
│   └── global/                ← Feature components
│       ├── dashboard/
│       ├── contacts/
│       ├── deals/
│       ├── tasks/
│       ├── emails/
│       ├── calendar/
│       ├── products/
│       ├── documents/
│       ├── automations/
│       ├── reports/
│       └── team/
│
├── pages/                     ← Route pages
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
│   ├── useContactsStore.ts
│   ├── useDealsStore.ts
│   ├── useTasksStore.ts
│   ├── useEmailsStore.ts
│   ├── useTeamStore.ts
│   ├── useUIStore.ts
│   └── useSideBarStore.ts
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
│   ├── auth.ts
│   ├── contacts.ts
│   ├── deals.ts
│   └── ...
│
├── types/                     ← TypeScript types
│   ├── index.ts
│   ├── user.ts
│   ├── contact.ts
│   ├── deal.ts
│   └── ...
│
└── utils/                     ← Helpers
    ├── formatters.ts
    ├── validators.ts
    └── constants.ts
```

---

## Alias (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## Vite Config

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```