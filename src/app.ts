import fastify from 'fastify'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'

import { transactionsRoutes } from './routes/transactions'

export const app = fastify()

app.register(cookie)

app.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
  frameguard: { action: 'deny' },
})

app.register(rateLimit, {
  global: true,
  max: 10,
  timeWindow: '1 minute',
  addHeaders: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true,
  },
})

app.register(transactionsRoutes, {
  prefix: 'transactions',
})
