import { Knex } from 'knex'
import {
  Transaction,
  TransactionRepository,
} from '../interfaces/transaction.repository'

export class KnexTransactionRepository implements TransactionRepository {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly knex: Knex) {}

  async create(
    transaction: Omit<Transaction, 'id' | 'created_at'>,
  ): Promise<void> {
    await this.knex('transactions').insert({
      ...transaction,
      id: crypto.randomUUID(),
      created_at: new Date(),
    })
  }

  async findBySession(sessionId: string): Promise<Transaction[]> {
    return this.knex('transactions').where('session_id', sessionId).select('*')
  }

  async getSummary(sessionId: string): Promise<number> {
    const result = await this.knex('transactions')
      .sum('amount', { as: 'amount' })
      .where('session_id', sessionId)
      .first()

    return Number(result?.amount || 0)
  }

  async findByID(id: string, sessionId: string): Promise<Transaction> {
    return this.knex('transactions')
      .where('id', id)
      .andWhere('session_id', sessionId)
      .first()
  }

  async healthChech(): Promise<string> {
    return await this.knex
      .raw('SELECT 1')
      .then(() => 'healthy')
      .catch(() => 'down')
  }
}
