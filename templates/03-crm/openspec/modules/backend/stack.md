# Stack - Dependencias y Tecnologías

## Dependencias

```json
{
  "dependencies": {
    "@fastify/compress": "^8.3.1",
    "@fastify/cors": "^11.2.0",
    "@fastify/helmet": "^13.0.2",
    "@fastify/jwt": "^10.0.0",
    "@fastify/rate-limit": "^10.3.0",
    "@prisma/client": "^5.22.0",
    "bcrypt": "^6.0.0",
    "dotenv": "^17.3.1",
    "fastify": "^5.7.4",
    "ioredis": "^5.10.0",
    "jsonwebtoken": "^9.0.3",
    "pino": "^10.3.1",
    "pino-pretty": "^13.1.3",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/bcrypt": "^6.0.0",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^25.3.3",
    "prisma": "^5.22.0",
    "tsup": "^8.5.1",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3"
  }
}
```

---

## Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src/server.ts --format cjs --dts",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

---

## Estructura de Archivos

```
src/
├── app.ts                      ← Fastify app factory
├── server.ts                   ← Entry point
├── config/
│   ├── env.ts                  ← Environment variables
│   ├── prisma.ts               ← Prisma client
│   └── redis.ts                ← Redis client
├── core/
│   └── errors/
│       └── AppError.ts         ← Custom error classes
├── infrastructure/
│   └── logger.ts               ← Logger setup
├── presentation/
│   ├── routes.ts               ← Main router
│   └── middlewares/
│       ├── auth.ts             ← JWT authentication
│       ├── rbac.ts             ← Role-based access
│       └── errorHandler.ts     ← Error handling
├── modules/
│   ├── auth/
│   ├── users/
│   ├── contacts/
│   ├── deals/
│   ├── tasks/
│   ├── emails/
│   ├── calendar/
│   ├── products/
│   ├── documents/
│   ├── automations/
│   ├── reports/
│   └── team/
└── types/
    └── index.ts                ← Type exports
```