import { createClient } from 'redis'
import { env } from '../env'

const redis = createClient({
  url: env.REDIS_URL || 'redis://localhost:6379',
})

redis.on('error', (err) => console.error('Redis Client Error', err))

// Conecta ao Redis quando o aplicativo iniciar
;(async () => {
  await redis.connect()
})()

export { redis }
