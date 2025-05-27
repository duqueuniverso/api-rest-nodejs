import { table } from 'console'
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.index(
      ['session_id', 'created_at'],
      'idx_transactions_session_created',
    )
    table.index(['session_id', 'amount'], 'idx_transactions_session_amount')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.dropIndex([], 'idx_transactions_session_created')
    table.dropIndex([], 'idx_transactions_session_amount')
  })
}
