import Redis from "ioredis";
import { env } from "@/config/env";

const redisConfig = {
  host: env?.REDIS_HOST,
  port: env?.REDIS_PORT,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: () => null,
  reconnectOnError: () => false
}

export const redis = new Redis(redisConfig)

redis.on("error", (_error) => { })


export const isRedisConnected = () => redis.status === "ready"
