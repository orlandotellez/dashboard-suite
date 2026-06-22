# Redis - Cache y Sesiones en IntegrityCRM

## Visión General

Redis se utiliza para tres propósitos principales en el backend:

1. **Caché de consultas frecuentes** - Reducir carga en PostgreSQL
2. **Rate limiting distribuido** - Control de requests por IP/user
3. **Blacklist de tokens** - Invalidar sesiones revocadas

---

## Configuración

### Dependencias

```json
{
  "dependencies": {
    "ioredis": "^5.10.0"
  }
}
```

### Archivo de Configuración

```typescript
// src/config/redis.ts
import Redis from 'ioredis'
import { config } from './env.js'

let redisClient: Redis | null = null

export const getRedisClient = () => {
  if (redisClient) return redisClient

  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectionName: 'integritycrm',
    })

    redisClient.on('error', (err) => {
      console.warn('Redis connection error (non-fatal):', err.message)
    })

    return redisClient
  } catch (error) {
    console.warn('Redis unavailable, continuing without cache')
    return null
  }
}

export const redis = getRedisClient()
```

### Variables de Entorno

```bash
# .env
REDIS_URL=redis://localhost:6379
```

### Graceful Degradation

Si Redis no está disponible, el sistema continúa funcionando sin caché. Esto es importante para desarrollo local sin Redis.

---

## Casos de Uso

### 1. Caché de Consultas Frecuentes

**¿Qué cachear?**
- Dashboard statistics ( KPIs )
- Listas de contactos ( sin filtros )
- Catálogos de productos
- Configuraciones de usuario

**TTL sugerido**: 30-60 segundos para datos que cambian frecuentemente, 5-15 minutos para datos casi estáticos.

**Ejemplo - Cachear estadísticas del dashboard**:

```typescript
// src/modules/reports/application/stats.service.ts
import { redis } from '@/config/redis.js'

const CACHE_TTL = 60 // 1 minuto

export const statsService = {
  async getDashboardStats(userId: string) {
    const cacheKey = `stats:dashboard:${userId}`

    // Try cache first
    const cached = await redis?.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // Fetch from DB
    const stats = await this.calculateStats(userId)

    // Cache result
    await redis?.setex(cacheKey, CACHE_TTL, JSON.stringify(stats))

    return stats
  },

  async invalidateDashboardCache(userId: string) {
    await redis?.del(`stats:dashboard:${userId}`)
  },
}
```

**Invalidación de caché**:
- Cuando se crea/actualiza/elimina un registro, invalidar la caché relacionada
- Usar prefijos de clave para facilitar invalidación en masa

```typescript
// Ejemplo: invalidar toda la caché de un usuario
async function invalidateUserCache(userId: string) {
  const keys = await redis?.keys(`*:${userId}`)
  if (keys?.length) {
    await redis?.del(...keys)
  }
}
```

### 2. Rate Limiting Distribuido

**Estrategia**: Usar sliding window con Redis.

```typescript
// src/presentation/middlewares/rateLimit.ts
import { redis } from '@/config/redis.js'

export const createRateLimiter = ({
  windowMs = 60000,
  maxRequests = 100,
  keyGenerator = (request) => request.ip,
}) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const key = `ratelimit:${keyGenerator(request)}`
    const now = Date.now()

    // Get current window
    const current = await redis?.get(key)
    let count = current ? parseInt(current) : 0

    if (count >= maxRequests) {
      reply.code(429).send({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000),
      })
      return
    }

    // Increment counter
    const pipeline = redis?.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, Math.ceil(windowMs / 1000))
    await pipeline?.exec()
  }
}

// Uso en routes
app.addHook('preHandler', createRateLimiter({
  windowMs: 60000, // 1 minuto
  maxRequests: 100,
  keyGenerator: (req) => req.ip,
}))
```

### 3. Blacklist de Tokens Revocados

**Uso**: Cuando un usuario hace logout desde todos los dispositivos o un admin revoca un token.

```typescript
// src/infrastructure/auth/tokenBlacklist.ts
import { redis } from '@/config/redis.js'

const TOKEN_BLACKLIST_TTL = 7 * 24 * 60 * 60 // 7 días (mismo que refresh token)

export const tokenBlacklist = {
  async addToBlacklist(tokenId: string) {
    await redis?.setex(
      `blacklist:${tokenId}`,
      TOKEN_BLACKLIST_TTL,
      '1'
    )
  },

  async isBlacklisted(tokenId: string): Promise<boolean> {
    const result = await redis?.get(`blacklist:${tokenId}`)
    return result === '1'
  },
}

// Middleware para verificar blacklist
export const checkBlacklist = async (request: FastifyRequest) => {
  const tokenId = request.user?.jti // JWT ID
  if (tokenId) {
    const isBlacklisted = await tokenBlacklist.isBlacklisted(tokenId)
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked')
    }
  }
}
```

---

## Estructura de Claves en Redis

| Prefijo | Descripción | Ejemplo |
|---------|-------------|---------|
| `stats:*` | Estadísticas cacheadas | `stats:dashboard:user123` |
| `ratelimit:*` | Rate limiting | `ratelimit:192.168.1.1` |
| `blacklist:*` | Tokens revocados | `blacklist:token-uuid` |
| `cache:*` | Caché general | `cache:contacts:list` |
| `lock:*` | Distributed locks | `lock:update-stats:user123` |

---

## Patrón de Caché en Repository

```typescript
// src/modules/contacts/infrastructure/contacts.repository.ts
import { redis } from '@/config/redis.js'

const CACHE_PREFIX = 'contacts'
const CACHE_TTL = 60

export const contactsRepository = {
  async findAll(userId: string, filters?: ContactFilters) {
    // Generate cache key from filters
    const cacheKey = `${CACHE_PREFIX}:list:${userId}:${JSON.stringify(filters || {})}`

    // Try cache
    const cached = await redis?.get(cacheKey)
    if (cached) return JSON.parse(cached)

    // Query DB
    const contacts = await prisma.contact.findMany({
      where: { userId, ...filters },
    })

    // Cache result
    await redis?.setex(cacheKey, CACHE_TTL, JSON.stringify(contacts))

    return contacts
  },

  async create(data: CreateContactDTO) {
    const contact = await prisma.contact.create({ data })

    // Invalidate list cache
    await this.invalidateListCache(data.userId)

    return contact
  },

  async invalidateListCache(userId: string) {
    const keys = await redis?.keys(`${CACHE_PREFIX}:list:${userId}:*`)
    if (keys?.length) {
      await redis?.del(...keys)
    }
  },
}
```

---

## Consideraciones de Producción

### Conexión

- Usar `lazyConnect: true` para no bloquear el startup
- Implementar reconexión automática (ioredis lo hace por defecto)
- Configurar `maxRetriesPerRequest` para no bloquear el server

### Fallback

```typescript
// Helper para operaciones con fallback
async function withCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = await redis?.get(key)
  if (cached) return JSON.parse(cached)

  const result = await fetchFn()
  await redis?.setex(key, ttl, JSON.stringify(result))
  return result
}
```

### Monitoreo

- keys *redis* para ver uso de memoria
- monitor para debug en desarrollo
- Considerar Redis Cluster para alta disponibilidad

---

## Testing

```typescript
// tests/unit/redis/cache.test.ts
import { describe, it, expect, beforeEach } from 'bun:test'

// Mock Redis para tests
const mockRedis = {
  get: () => null,
  setex: () => 'OK',
  del: () => 1,
}

describe('Cache Service', () => {
  it('should return cached data if available', async () => {
    const cachedData = { count: 10 }
    mockRedis.get = () => JSON.stringify(cachedData)

    const result = await getDashboardStats('user1')
    expect(result).toEqual(cachedData)
  })
})
```

---

## Resumen de Implementación

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Config Redis | ✅ Listo | `src/config/redis.ts` |
| Cache Service | Por implementar | Cache genérico |
| Rate Limiter | Por implementar | Middleware con Redis |
| Token Blacklist | Por implementar | Revocación de tokens |
| Repository caching | Por implementar | Contacts, Stats |