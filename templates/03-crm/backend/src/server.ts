import 'dotenv/config'
import { buildApp } from './app.js'
import { config } from './config/env.js'
import { logger } from './infrastructure/logger.js'

const start = async () => {
  try {
    const app = await buildApp()

    await app.listen({
      port: config.port,
      host: '0.0.0.0',
    })

    logger.info(`Server running on http://0.0.0.0:${config.port}`)
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

start()
