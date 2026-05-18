import { PGlite } from '@electric-sql/pglite'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import { afterAll, beforeAll, vi } from 'vitest'
import { Prisma, PrismaClient } from './src/prisma/generated/client.js'

const pgClient = new PGlite()
const adapter = new PrismaPGlite(pgClient)

// Patch pglite-prisma-adapter's onError to map PostgreSQL error codes
{
  const tmp = await adapter.connect()
  const baseProto = Object.getPrototypeOf(Object.getPrototypeOf(tmp))
  const originalOnError = baseProto.onError

  baseProto.onError = function (error: unknown) {
    try {
      originalOnError.call(this, error)
    } catch (driverError: unknown) {
      const cause = (driverError as { cause?: Record<string, unknown> }).cause
      if (cause && typeof cause.code === 'string') {
        switch (cause.code) {
          case '23505': {
            cause.kind = 'UniqueConstraintViolation'
            cause.code = 'P2002'
            const fields = (cause.detail as string)
              ?.match(/Key \(([^)]+)\)/)
              ?.at(1)
              ?.split(', ')
            cause.constraint = fields ? { fields } : undefined
            break
          }
          case '23503': {
            cause.kind = 'ForeignKeyConstraintViolation'
            cause.code = 'P2003'
            cause.constraint = cause.column
              ? { fields: [cause.column] }
              : undefined
            break
          }
        }
      }
      throw driverError
    }
  }
}

// Map raw PostgreSQL error codes to Prisma P-codes
const PG_TO_PRISMA_CODE: Record<string, string> = {
  '23505': 'P2002',
  '23503': 'P2003',
  '22P02': 'P2023',
}

// @ts-expect-error : works with older @prisma/driver-adapter-utils
const basePrisma = new PrismaClient({ adapter })
const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        try {
          return await query(args)
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            const mapped = PG_TO_PRISMA_CODE[err.code]
            if (mapped) {
              ;(err as { code: string }).code = mapped
            }
          }
          throw err
        }
      },
    },
  },
})

vi.mock('./src/prisma/client', () => ({ prisma }))

const prismaMigrationDir = path.join('.', 'prisma', 'migrations')

beforeAll(async () => {
  const [migrationPaths] = await Promise.all([
    readdir(prismaMigrationDir),
  ])

  await migrationPaths
    .filter((migrationPath) => migrationPath !== 'migration_lock.toml')
    .map((migrationPath) =>
      path.join(prismaMigrationDir, migrationPath, 'migration.sql')
    )
    .reduce(async (promise, filename) => {
      await promise
      const migration = await readFile(filename, 'utf8')
      await pgClient.exec(migration)
    }, Promise.resolve())
})

afterAll(async () => {
  await prisma.$disconnect()
  await pgClient.close()
})
