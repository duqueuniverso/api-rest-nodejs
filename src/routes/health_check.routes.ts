import { FastifyInstance } from 'fastify'

export async function healthCheckRoutes(app: FastifyInstance) {
  const repository = app.repository

  app.get('/health', async () => ({
    status: 'ok',
    db: repository.healthChech(),
    uptime: process.uptime(),
  }))
}
