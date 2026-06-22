import pino from 'pino'
import { config } from '../config/env.js'

export const logger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  transport: config.nodeEnv === 'development'
    ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
})

export const createChildLogger = (name: string) => {
  return logger.child({ module: name })
}
