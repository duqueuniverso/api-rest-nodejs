import { app } from '../src/app'
import { afterAll, beforeAll } from 'vitest'
import { execSync } from 'child_process'

beforeAll(async () => {
  execSync('npm run knex migrate:rollback --all')
  execSync('npm run knex migrate:latest')
  await app.ready()
})

afterAll(async () => {
  await app.close()
})
