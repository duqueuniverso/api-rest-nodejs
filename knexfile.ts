// import { config } from './src/database'

// export default config

import type { Knex } from 'knex'
import { env } from './src/env'

const config: Knex.Config = {
  client: 'pg',
  connection: {
    connectionString: env.DATABASE_URL,
    ssl: true
  },
  migrations: {
    extension: 'ts',
    directory: './db/migrations'
  }
}

export default config