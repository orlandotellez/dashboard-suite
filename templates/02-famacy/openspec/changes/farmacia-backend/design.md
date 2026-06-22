# Design: Farmacia Backend (Real)

## Technical Approach

Replicar exactamente la arquitectura modular de `stockmolt/backend` (Fastify v5 + Prisma + JWT + Redis) adaptada al dominio farmacéutico. Cada módulo domain sigue clean/hexagonal architecture con 4 capas: `presentation/` (routes, controllers, DTOs), `application/` (services), `infrastructure/` (repositories), `domain/` (interfaces, entidades). DI manual en route files.

## Architecture Decisions

| Decision | Option | Tradeoff | Decision |
|----------|--------|----------|----------|
| **Stack** | Fastify + Prisma + PostgreSQL + Redis | Redis opcional agrega `isRedisConnected()` checks | **Confirmado** - Patrón validado en backend referencia |
| **Module Structure** | `src/modules/{domain}/{layer}/` | Verboso pero separation of concerns clara | **Confirmado** - Consistencia total con stockmolt |
| **Soft Delete** | `deletedAt DateTime?` en todos los modelos | No elimina físicamente, referential integrity se mantiene | **Confirmado** - Requerido en specs |
| **Validation** | Zod schemas en DTOs, `.parse()` en controllers | Runtime validation, no compile-time | **Confirmado** - Mismo patrón que backend referencia |
| **DI Pattern** | Manual: `new Repo()` → `new Service()` en routes | No hay DI container, verboso pero explícito | **Confirmado** - Consistencia con arquitectura existente |
| **Auth** | JWT access (15min) + refresh (7d) en Redis | Refresh tokens requieren Redis, fallback a access token | **Confirmado** - Especificado en backend-auth spec |
| **Application Layer** | Siempre presente (aplicar en todos los módulos) | Algunos módulos en backend referencia la omiten | **Decidido** - Mantener consistencia, USAR service layer siempre |

## Data Flow

```
HTTP Request → Fastify Route → Controller (DTO parse) → Service (business logic) → Repository (Prisma) → PostgreSQL
                            ↓
                    Error Handler (AppError / ZodError)
```

**Auth Flow (login)**:
```
POST /auth/login → auth.controller.login() → auth.service.login() → userRepository.findByEmail()
  → bcrypt.compare() → generateTokens() → redis.set(refreshToken, userId) → return tokens
```

**Sales Flow (transaction)**:
```
POST /sales → sales.controller.register() → sales.service.register() → $transaction():
  1. saleRepository.create(sale)
  2. saleItemRepository.createMany(items)
  3. medicineRepository.updateMany(decrement stock)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `farmacia-project/backend/package.json` | Create | Dependencias: fastify, @fastify/jwt, @fastify/cors, @fastify/helmet, @fastify/compress, @fastify/rate-limit, prisma, @prisma/client, zod, bcrypt, redis, dotenv |
| `farmacia-project/backend/tsconfig.json` | Create | ES2022, CommonJS, path aliases `@/*` → `src/*` |
| `farmacia-project/backend/docker-compose.yml` | Create | postgres:15-alpine (db: farmacia, user: farmacia, pass: farmacia), redis:7-alpine |
| `farmacia-project/backend/prisma/schema.prisma` | Create | Modelos: User (admin/staff/customer), Medicine, Sale, SaleItem, Client, Supplier, Lab - todos con `deletedAt` |
| `farmacia-project/backend/src/config/env.ts` | Create | Zod-validated env vars: DATABASE_URL, JWT_SECRET, REDIS_URL, PORT |
| `farmacia-project/backend/src/config/prisma.ts` | Create | PrismaClient singleton export |
| `farmacia-project/backend/src/config/redis.ts` | Create | Redis client con `isRedisConnected()` helper |
| `farmacia-project/backend/src/core/errors/AppError.ts` | Create | AppError class + NotFoundError, UnauthorizedError, ForbiddenError, ConflictError |
| `farmacia-project/backend/src/presentation/middlewares/errorHandler.ts` | Create | Manejo de AppError, ZodError, Fastify errors |
| `farmacia-project/backend/src/presentation/middlewares/rbac.ts` | Create | `requireRoles(['admin','staff'])` middleware usando `preHandler` |
| `farmacia-project/backend/src/presentation/middlewares/auth.ts` | Create | Fastify JWT plugin registration, `authenticate` decorator |
| `farmacia-project/backend/src/modules/auth/presentation/auth.routes.ts` | Create | POST /register, /login, /refresh, /logout (con authenticate) |
| `farmacia-project/backend/src/modules/auth/presentation/auth.controller.ts` | Create | register(), login(), refresh(), logout() - parse DTOs |
| `farmacia-project/backend/src/modules/auth/presentation/auth.dto.ts` | Create | RegisterDtoSchema, LoginDtoSchema, RefreshTokenDtoSchema (Zod) |
| `farmacia-project/backend/src/modules/auth/application/auth.service.ts` | Create | register(), login(), refresh(), logout() - bcrypt, JWT, Redis |
| `farmacia-project/backend/src/modules/users/domain/user.repository.interface.ts` | Create | `IUserRepository` con findByEmail(), findById(), create(), update(), delete() |
| `farmacia-project/backend/src/modules/users/infrastructure/user.repository.ts` | Create | Prisma implementation de IUserRepository |
| `farmacia-project/backend/src/modules/users/application/user.service.ts` | Create | CRUD lógica, RBAC checks (no self-delete/self-role-change) |
| `farmacia-project/backend/src/modules/users/presentation/user.routes.ts` | Create | GET/POST/PUT/DELETE /users con requireRoles(['admin']) |
| `farmacia-project/backend/src/modules/users/presentation/user.controller.ts` | Create | Controller methods, DTO parsing |
| `farmacia-project/backend/src/modules/users/presentation/user.dto.ts` | Create | CreateUserDto, UpdateUserDto, UserResponse (Zod) |
| `farmacia-project/backend/src/modules/medicines/` | Create | Misma estructura que users: domain/, infrastructure/, application/, presentation/ - stock update vía PATCH |
| `farmacia-project/backend/src/modules/sales/` | Create | Sales + SaleItems con `$transaction()` para atomicidad |
| `farmacia-project/backend/src/modules/clients/` | Create | Client management con búsqueda por documento/email |
| `farmacia-project/backend/src/modules/reports/` | Create | Solo presentation/ (queries directas a Prisma) - dashboard, top-medicines, stock-status |
| `farmacia-project/backend/src/app.ts` | Create | Fastify instance, register plugins (cors, helmet, compress, rate-limit, jwt), register routes |
| `farmacia-project/backend/src/server.ts` | Create | Bootstrap: connect DB, Redis, start server |

## Interfaces / Contracts

**Prisma Schema (clave)**:
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(customer)
  deletedAt DateTime?
  sales     Sale[]
  clients   Client[]
  @@index([email])
  @@map("users")
}

enum Role { admin staff customer }

model Medicine {
  id            String   @id @default(uuid())
  tradeName     String
  genericName   String
  description   String?
  price         Decimal
  stock         Int      @default(0)
  expiryDate    DateTime?
  laboratoryId  String
  categoryId    String
  laboratory    Lab      @relation(fields: [laboratoryId], references: [id])
  category      Category @relation(fields: [categoryId], references: [id])
  saleItems     SaleItem[]
  deletedAt     DateTime?
  @@index([tradeName, genericName])
  @@map("medicines")
}

model Sale {
  id          String     @id @default(uuid())
  date        DateTime   @default(now())
  total       Decimal
  paymentMethod String
  userId      String
  clientId    String?
  user        User       @relation(fields: [userId], references: [id])
  client      Client?    @relation(fields: [clientId], references: [id])
  items       SaleItem[]
  @@map("sales")
}

model SaleItem {
  id         String   @id @default(uuid())
  saleId     String
  medicineId String
  quantity   Int
  unitPrice  Decimal
  sale       Sale     @relation(fields: [saleId], references: [id])
  medicine   Medicine @relation(fields: [medicineId], references: [id])
  @@map("sale_items")
}

model Client {
  id             String   @id @default(uuid())
  name           String
  documentNumber String   @unique
  email          String?
  phone          String?
  address        String?
  membership     String   @default("bronze")
  deletedAt      DateTime?
  sales          Sale[]
  @@map("clients")
}

model Lab {
  id        String     @id @default(uuid())
  name      String
  medicines Medicine[]
  deletedAt DateTime?
  @@map("labs")
}

model Supplier {
  id        String   @id @default(uuid())
  name      String
  contact   String?
  deletedAt DateTime?
  @@map("suppliers")
}

model Category {
  id        String   @id @default(uuid())
  name      String
  medicines Medicine[]
  @@map("categories")
}
```

**Repository Interface Example** (users):
```typescript
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAllActive(): Promise<User[]>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  softDelete(id: string): Promise<void>;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Services (auth hash/compare, sales transaction logic) | Jest + mocks para repositories |
| Integration | API endpoints con test DB | `tap` o `fastify.inject()` - NO implementado aún (fuera de scope) |
| E2E | Flujo completo login → create sale | NO implementado (fuera de scope) |

## Migration / Rollout

No migration required. New database from scratch via `prisma migrate dev`.

## Open Questions

- [ ] ¿Redis es realmente opcional o deberíamos hacer wrapper para evitar `isRedisConnected()` checks dispersos? (Decision: mantener patrón existente por ahora)
- [ ] ¿Deberíamos agregar índices compuestos en Prisma para optimizar queries de reports? (Ej: sale(date, userId))

## Next Step

Ready for tasks (sdd-tasks).
