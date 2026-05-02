## Exploration: Backend Architecture Analysis (stockmolt → farmacia-project)

### Current State
The stockmolt backend uses **Fastify v5** with a **modular hexagonal/clean architecture**. Each domain module (auth, users, products, categories, suppliers, inventory, dashboard) follows a layered structure:

- **presentation/**: Routes, controllers, DTOs (Zod validation)
- **application/**: Services with business logic (used in auth, inventory; skipped in products, users)
- **infrastructure/**: Repository implementations (Prisma)
- **domain/**: Interfaces for repositories

**Key technical details:**
- **Fastify plugins**: @fastify/jwt, @fastify/cors, @fastify/helmet, @fastify/compress, @fastify/rate-limit
- **Database**: PostgreSQL via Prisma ORM with soft delete pattern (deletedAt field), UUID primary keys
- **Caching**: Redis (optional) with graceful degradation using `isRedisConnected()` checks
- **Validation**: Zod schemas in DTO files, parsed with `.parse()` in controllers
- **Error handling**: Custom `AppError` hierarchy with `statusCode` property, global error handler
- **Auth**: JWT with access/refresh tokens, refresh tokens stored in Redis with TTL
- **Authorization**: RBAC middleware `requireRoles([Role.ADMIN, Role.MANAGER])` using `preHandler` hook
- **Dependency Injection**: Manual in route files (no DI container)
- **TypeScript**: CommonJS modules, ES2022 target, path aliases `@/*` → `src/*`
- **Docker**: postgres:15-alpine, redis:7-alpine services

### Affected Areas
- `farmacia-project/backend/package.json` — Needs Fastify, Prisma, JWT, bcrypt, Zod, Redis dependencies
- `farmacia-project/backend/tsconfig.json` — Same TypeScript config (ES2022, CommonJS, path aliases)
- `farmacia-project/backend/src/` — Modular structure with modules/{domain}/{layers}
- `farmacia-project/backend/prisma/schema.prisma` — Domain models adapted for pharmacy (medicines, prescriptions, etc.)
- `farmacia-project/backend/docker-compose.yml` — PostgreSQL + Redis services
- `farmacia-project/backend/src/config/env.ts` — Zod-validated environment variables
- `farmacia-project/backend/src/core/errors/` — AppError hierarchy
- `farmacia-project/backend/src/infrastructure/` — Prisma client, Redis client, Pino logger
- `farmacia-project/backend/src/presentation/middlewares/` — errorHandler, rbac middlewares

### Approaches

1. **Exact Replication (Same modular structure)**
   - Pros: Consistent with stockmolt, proven pattern, clear separation of concerns, easy to maintain
   - Cons: Might be overkill for simpler pharmacy needs, manual DI can be verbose, mixed patterns (some modules skip application layer)
   - Effort: Medium (copy structure, adapt domain models)

2. **Simplified Version (Skip application layer for simple CRUD)**
   - Pros: Less boilerplate, faster to implement, controllers talk directly to repositories
   - Cons: Loses consistency, harder to add complex business logic later (e.g., inventory movements, prescriptions)
   - Effort: Low

3. **Hybrid (Keep architecture, use services only where needed)**
   - Pros: Best of both worlds, consistent with existing patterns, flexibility per module
   - Cons: Need to decide per module which approach, potential inconsistency
   - Effort: Medium

### Recommendation

**Approach 1: Exact Replication** — The codebase shows a mature, well-structured backend. For a pharmacy system (farmacia), you'll likely need:
- Business logic for inventory movements (similar to stockmolt's inventory module)
- Prescription processing (will need application service layer)
- Role-based access for pharmacists, admins, technicians

The `inventory` module pattern (with `application/service` layer using Prisma transactions) is ideal for pharmacy needs. Use the same folder structure, Zod validation, error handling, and RBAC middleware.

Key decision: **Stick with CommonJS** (like stockmolt) for consistency, or **migrate to ESM** for modern Node.js? Recommend staying with CommonJS to match the source architecture.

### Risks

- **Manual Dependency Injection**: Route files instantiate repositories and services directly (`new Repository()` → `new Service()`). No DI container. This works but can be harder to test.
- **Redis Optional Pattern**: The `isRedisConnected()` checks throughout controller code add noise. Consider creating a wrapper/cache service if replicating.
- **Mixed Patterns**: Some modules (products, users) skip the `application` service layer and talk directly to repositories. Others (inventory, auth) use services. Maintain consistency in farmacia-project.
- **CommonJS vs ESM**: The project uses `"type": "commonjs"` and `tsconfig.json` with `"module": "CommonJS"`. Fastify v5 works fine, but modern ESM might be preferred for new projects.

### Ready for Proposal

**Yes** — The architecture is well understood. The orchestrator should tell the user:
1. We'll replicate the exact modular hexagonal structure from stockmolt backend
2. Domain models will be adapted for pharmacy (medicines, prescriptions, suppliers, customers, etc.)
3. Same tech stack: Fastify + Prisma + PostgreSQL + Redis (optional caching)
4. Same patterns: Zod validation in DTOs, AppError hierarchy, RBAC middleware, JWT auth with refresh tokens
5. Decision needed: Should we use the same CommonJS setup or migrate to ESM? (Recommend: stay with CommonJS for consistency)
