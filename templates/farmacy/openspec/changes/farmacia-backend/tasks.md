# Tasks: Farmacia Backend

## Phase 1: Configuración Inicial
- [x] 1.1 Create `backend/package.json`: fastify, @fastify/*, prisma, zod, bcrypt, redis, dotenv, typescript
- [x] 1.2 Create `backend/tsconfig.json`: ES2022, CommonJS, `@/*` → `src/*`
- [x] 1.3 Create `backend/docker-compose.yml`: postgres:15-alpine + redis:7-alpine
- [x] 1.4 Create `backend/.env.example`: DATABASE_URL, JWT_SECRET, REDIS_URL, PORT
- [x] 1.5 Create `backend/src/config/env.ts`: Zod-validated env vars

## Phase 2: Prisma Schema
- [x] 2.1 Create `backend/prisma/schema.prisma`: User (roles, deletedAt), indexes
- [x] 2.2 Add Medicine: tradeName, genericName, price, stock, labs/cats relations, deletedAt
- [x] 2.3 Add Sale + SaleItem: date, total, paymentMethod, items with medicine/quantity/price
- [x] 2.4 Add Client: documentNumber unique, membership bronze default, deletedAt
- [x] 2.5 Add Lab, Supplier, Category models with deletedAt
- [x] 2.6 Run `prisma migrate dev --name init` to generate client and tables

## Phase 3: Core/Shared
- [x] 3.1 Create `src/config/prisma.ts`: PrismaClient singleton
- [x] 3.2 Create `src/config/redis.ts`: Client + `isRedisConnected()`
- [x] 3.3 Create `src/core/errors/AppError.ts`: AppError + error subclasses
- [x] 3.4 Create `src/presentation/middlewares/errorHandler.ts`: Handle AppError, ZodError
- [x] 3.5 Create `src/presentation/middlewares/rbac.ts`: `requireRoles()` with `preHandler`
- [x] 3.6 Create `src/presentation/middlewares/auth.ts`: JWT plugin + `authenticate`

## Phase 4: Domain Modules

### Auth
- [x] 4.1 `modules/auth/presentation/auth.dto.ts`: Register/Login/Refresh DTOs (Zod)
- [x] 4.2 `modules/auth/application/auth.service.ts`: register/login/refresh/logout
- [x] 4.3 `modules/auth/presentation/auth.controller.ts`: Controller methods
- [x] 4.4 `modules/auth/presentation/auth.routes.ts`: POST /register, /login, /refresh, /logout

### Users
- [x] 4.5 `modules/users/domain/user.repository.interface.ts`: IUserRepository
- [x] 4.6 `modules/users/infrastructure/user.repository.ts`: Prisma impl
- [x] 4.7 `modules/users/application/user.service.ts`: CRUD + RBAC checks
- [x] 4.8 `modules/users/presentation/user.dto.ts`: Create/Update DTOs
- [x] 4.9 `modules/users/presentation/user.controller.ts`: Controller
- [x] 4.10 `modules/users/presentation/user.routes.ts`: GET/POST/PUT/DELETE /users

### Medicines
- [x] 4.11 `modules/medicines/domain/medicine.repository.interface.ts`: IMedicineRepository
- [x] 4.12 `modules/medicines/infrastructure/medicine.repository.ts`: Prisma impl
- [x] 4.13 `modules/medicines/application/medicine.service.ts`: CRUD + stock logic
- [x] 4.14 `modules/medicines/presentation/medicine.dto.ts`: DTOs including stock update
- [x] 4.15 `modules/medicines/presentation/medicine.controller.ts`: Controller
- [x] 4.16 `modules/medicines/presentation/medicine.routes.ts`: CRUD + PATCH /:id/stock

### Sales
- [x] 4.17 `modules/sales/domain/sale.repository.interface.ts`: ISaleRepository
- [x] 4.18 `modules/sales/infrastructure/sale.repository.ts`: Prisma impl
- [x] 4.19 `modules/sales/application/sale.service.ts`: register() with $transaction()
- [x] 4.20 `modules/sales/presentation/sale.dto.ts`: CreateSaleDto, SaleItemDto
- [x] 4.21 `modules/sales/presentation/sale.controller.ts`: Controller
- [x] 4.22 `modules/sales/presentation/sale.routes.ts`: GET/POST /sales, GET /:id

### Clients
- [x] 4.23 `modules/clients/domain/client.repository.interface.ts`: IClientRepository
- [x] 4.24 `modules/clients/infrastructure/client.repository.ts`: Prisma impl
- [x] 4.25 `modules/clients/application/client.service.ts`: CRUD + history
- [x] 4.26 `modules/clients/presentation/client.dto.ts`: Create/Update DTOs
- [x] 4.27 `modules/clients/presentation/client.controller.ts`: Controller
- [x] 4.28 `modules/clients/presentation/client.routes.ts`: GET/POST/PUT/DELETE /clients

### Reports
- [x] 4.29 `modules/reports/presentation/report.controller.ts`: dashboard/sales/top/stock
- [x] 4.30 `modules/reports/presentation/report.routes.ts`: GET /reports/*

## Phase 5: Integration
- [x] 5.1 Create `src/app.ts`: Fastify instance, plugins, register all routes
- [x] 5.2 Create `src/server.ts`: Bootstrap DB/Redis, start server
- [x] 5.3 Add "dev", "build", "start" scripts to package.json
- [x] 5.4 Verify: `npm install` succeeds
- [x] 5.5 Verify: `docker-compose up -d` works
- [x] 5.6 Verify: `npm run dev` starts without errors
- [x] 5.7 Verify: POST /auth/register returns JWT
- [x] 5.8 Verify: POST /auth/login stores refresh token in Redis
