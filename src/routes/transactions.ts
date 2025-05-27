import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { hasValidSessionCookie } from '../middleware/check-session-id-exists'
import { env } from '../env'

export async function transactionsRoutes(app: FastifyInstance) {
  // Adicione antes das definições de rota
  app.addHook('preHandler', (request, reply, done) => {
    const allowedMethods = ['POST', 'PUT']

    if (allowedMethods.includes(request.method)) {
      const contentType = request.headers['content-type']
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(415).send({
          error: 'Unsupported Media Type',
          message: 'Content-Type must be application/json',
        })
      }
    }
    done()
  })

  app.get('/', { preHandler: [hasValidSessionCookie] }, async (request) => {
    const { sessionId } = request.cookies

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select('*')
    return transactions
  })

  app.get('/:id', { preHandler: [hasValidSessionCookie] }, async (request) => {
    const getTransacionsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { sessionId } = request.cookies
    const { id } = getTransacionsParamsSchema.parse(request.params)
    const transactions = await knex('transactions')
      .where('id', id)
      .andWhere('session_id', sessionId)
      .first()
    return { transactions }
  })

  app.get(
    '/summary',
    { preHandler: [hasValidSessionCookie] },
    async (request) => {
      const { sessionId } = request.cookies
      const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .where('session_id', sessionId)
        .first()

      return { summary }
    },
  )

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let { sessionId } = request.cookies

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
