import path from 'node:path'
import { afterAll, beforeAll, vi } from 'vitest'
import { createTestDatabase } from './src/test-utils/db.ts'

const db = await createTestDatabase()

vi.mock('./src/prisma/client', () => ({ prisma: db.prisma }))

const prismaMigrationDir = path.join('.', 'prisma', 'migrations')

beforeAll(async () => {
  await db.migrate(prismaMigrationDir)
})

afterAll(async () => {
  await db.teardown()
})
