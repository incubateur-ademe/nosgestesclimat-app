import path from 'node:path'
import { afterAll, beforeAll, vi } from 'vitest'
import { createTestDatabase } from './src/test-utils/db.ts'

const db = await createTestDatabase()

vi.mock('./src/prisma/client', () => ({ prisma: db.prisma }))

process.env.LEGACY_JWT_SECRET = 'test-legacy-jwt-secret-hs256-min-32-chars!'
process.env.SESSION_ENCRYPTION_KEY = 'dGVzdC1qb3NlLWVuY3J5cHRpb24ta2V5LTI1NmJpdCE='

const prismaMigrationDir = path.join('.', 'prisma', 'migrations')

beforeAll(async () => {
  await db.migrate(prismaMigrationDir)
})

afterAll(async () => {
  await db.teardown()
})
