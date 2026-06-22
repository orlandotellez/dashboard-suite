# Backend - Especificación para IntegrityCRM

## Estructura de Archivos

```
backend/
├── src/
│   ├── app.ts                 ← Fastify app factory
│   ├── server.ts              ← Entry point
│   ├── config/
│   │   ├── env.ts             ← Environment variables (Zod)
│   │   ├── prisma.ts          ← Prisma client
│   │   └── redis.ts           ← Redis client
│   ├── core/
│   │   └── errors/
│   │       └── AppError.ts    ← Custom error classes
│   ├── infrastructure/
│   │   └── logger.ts          ← Logger setup
│   ├── presentation/
│   │   ├── routes.ts          ← Main router
│   │   └── middlewares/
│   │       ├── auth.ts        ← JWT authentication
│   │       ├── rbac.ts        ← Role-based access
│   │       └── errorHandler.ts
│   ├── modules/
│   │   ├── auth/              ← Login, register, refresh
│   │   ├── users/             ← User management
│   │   ├── contacts/         ← CRUD Contacts
│   │   ├── deals/             ← Pipeline/Deals
│   │   ├── tasks/             ← Tasks
│   │   ├── emails/            ← Email management
│   │   ├── calendar/         ← Events
│   │   ├── products/         ← Products catalog
│   │   ├── documents/        ← Proposals, contracts
│   │   ├── automations/      ← Automation rules
│   │   ├── reports/          ← Analytics
│   │   └── team/             ← Team members
│   └── types/
│       └── index.ts           ← Type exports
├── prisma/
│   └── schema.prisma          ← Database schema
├── package.json
└── tsconfig.json
```

---

## Módulos Creados

| Archivo | Descripción |
|---------|-------------|
| `stack.md` | Dependencias y scripts |
| `prisma.md` | Schema completo con todos los modelos |
| `app-server.md` | app.ts, server.ts, config, routes |
| `errors.md` | AppError classes + error handler |
| `auth-rbac.md` | Auth middleware + RBAC |
| `modules-example.md` | Módulo Auth completo |
| `contacts-module.md` | Módulo Contacts CRUD |

---

## Patrón de Módulos

Cada módulo sigue esta estructura:

```
modules/{module}/
├── domain/
│   └── {module}.repository.interface.ts
├── application/
│   └── {module}.service.ts
├── infrastructure/
│   └── {module}.repository.ts
└── presentation/
    ├── {module}.controller.ts
    ├── {module}.routes.ts
    └── {module}.dto.ts
```

---

## Flujo de una Request

```
Request → Auth Middleware → RBAC Middleware → Controller → Service → Repository → Prisma → DB
```

---

## Permisos por Rol

| Módulo | ADMIN | MANAGER | VENDEDOR | SOLO_LECTURA |
|--------|-------|---------|----------|--------------|
| Auth | ✓ | ✓ | ✓ | - |
| Users | CRUD | R | - | - |
| Contacts | CRUD | CRUD | Propios | R |
| Deals | CRUD | CRUD | Propios | R |
| Tasks | CRUD | CRUD | Propios | R |
| Emails | CRUD | R | Propios | R |
| Reports | CRUD | R | Propio | R |
| Automations | CRUD | R | - | - |
| Team | CRUD | R | - | - |

---

## Pendientes de Crear

Los siguientes módulos necesitan ser implementados siguiendo el patrón de Contacts:

1. **Users** - CRUD de usuarios
2. **Deals** - Pipeline con stages
3. **Tasks** - Tasks con subtasks
4. **Emails** - Email management
5. **Calendar** - Events
6. **Products** - Product catalog
7. **Documents** - Proposals/contracts
8. **Automations** - Automation builder
9. **Reports** - Analytics endpoints
10. **Team** - Team management + invitations

---

## Siguiente Paso

Para comenzar a implementar, copiar la estructura de `contacts-module.md` y adaptar para cada nuevo módulo.

---

## Notas

- Usar Zod para validación de DTOs
- Prisma para acceso a datos
- JWT con access + refresh tokens
- Redis para blacklist de tokens
- RBAC con middleware de roles