# Proposal: Farmacia Backend (Real)

## Intent

Crear el backend real para el dashboard de farmacia replicando la arquitectura modular de `stockmolt/backend` (Fastify + Prisma + JWT + Redis + Clean Architecture).

## Scope

### In Scope
- Config inicial: `package.json`, `tsconfig.json`, `docker-compose.yml` (Postgres/Redis)
- Prisma schema: `User` (roles: admin/staff/customer), `Medicine`, `Sale`, `Client`, `Supplier`, `Lab` — todos con soft delete (`deletedAt`)
- Módulos Fastify: `auth` (JWT access/refresh), `users`, `medicines`, `sales`, `clients`, `reports`
- Core: Error handling (`AppError`), RBAC middleware (`requireRoles`), Prisma/Redis clients
- Estructura: `src/{domain}/{presentation,application,infrastructure,domain}`

### Out of Scope
- Integración con frontend (dashboard-farmacia ya tiene mock data)
- Testing (infraestructura no detectada en frontend)
- Despliegue / CI/CD
- ESM migration (quedamos en CommonJS como backend referencia)

## Capabilities

### New Capabilities
- `backend-auth`: JWT auth con access/refresh tokens, roles admin/staff/customer
- `backend-users`: CRUD usuarios con RBAC, soft delete
- `backend-medicines`: CRUD medicamentos, stock, búsqueda, soft delete
- `backend-sales`: Registro de ventas con transacciones Prisma
- `backend-clients`: Gestión de clientes de farmacia
- `backend-reports`: Estadísticas y gráficos (endpoints para dashboard)
- `backend-core`: Infraestructura base, error handling, middlewares, Prisma/Redis

### Modified Capabilities
None

## Approach

Replicar **exactamente** la arquitectura de `stockmolt/backend`:
- **Fastify v5** con plugins: `@fastify/jwt`, `@fastify/cors`, `@fastify/helmet`, `@fastify/compress`, `@fastify/rate-limit`
- **Validation**: Zod schemas en DTOs, `.parse()` en controllers
- **Auth**: JWT con refresh tokens en Redis (opcional, graceful degradation con `isRedisConnected()`)
- **Architecture**: Clean/Hexagonal modular — cada dominio tiene `domain/` (interfaces), `infrastructure/` (repos Prisma), `application/` (services con lógica de negocio), `presentation/` (routes/controllers/DTOs)
- **DI**: Manual en route files (`new Repo()` → `new Service()`)
- **Soft Delete**: Campo `deletedAt DateTime?` en todos los modelos Prisma
- **TypeScript**: CommonJS, ES2022 target, path aliases `@/*` → `src/*`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `farmacia-project/backend/package.json` | New | Dependencias Fastify, Prisma, JWT, bcrypt, Zod, Redis |
| `farmacia-project/backend/tsconfig.json` | New | ES2022, CommonJS, path aliases |
| `farmacia-project/backend/docker-compose.yml` | New | postgres:15-alpine, redis:7-alpine |
| `farmacia-project/backend/prisma/schema.prisma` | New | Modelos User, Medicine, Sale, Client, Supplier, Lab |
| `farmacia-project/backend/src/index.ts` | New | Fastify server, plugins, registro de módulos |
| `farmacia-project/backend/src/core/` | New | AppError, errorHandler, RBAC middleware |
| `farmacia-project/backend/src/config/` | New | env.ts validado con Zod |
| `farmacia-project/backend/src/infrastructure/` | New | Prisma client, Redis client, Pino logger |
| `farmacia-project/backend/src/modules/{auth,users,medicines,sales,clients,reports}/` | New | Estructura modular completa |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Redis opcional agrega ruido con `isRedisConnected()` | Medium | Documentar patrón, considerar wrapper en futuro |
| Manual DI verboso en routes | Low | Aceptable para la escala actual |
| Inconsistencia en capa `application/` (algunos módulos la omiten) | Medium | Definir criterio claro en design phase |
| CommonJS vs ESM | Low | Seguir recomendación de stay with CommonJS |

## Rollback Plan

1. Eliminar carpeta `farmacia-project/backend/` completa
2. Eliminar servicio en `docker-compose.yml` (si se integra al global)
3. Limpiar variables de entorno relacionadas

## Dependencies

- Arquitectura de referencia: `stockmolt/backend/` (Fastify v5 + Prisma + JWT)
- Frontend: `dashboard-farmacia` (ya tiene auth simulada y módulos mock)
- Docker para Postgres y Redis

## Success Criteria

- [ ] `npm install` funciona en `farmacia-project/backend/`
- [ ] `docker-compose up` levanta Postgres y Redis
- [ ] Prisma schema tiene todos los modelos con soft delete
- [ ] `src/` tiene estructura modular completa (6 módulos + core)
- [ ] Servidor Fastify inicia sin errores (`npm run dev`)
- [ ] `backend-auth` permite login y genera JWT válido
- [ ] RBAC middleware bloquea rutas según rol
