import { PGlite } from '@electric-sql/pglite'
import { Prisma, PrismaClient } from '@nosgestesclimat/core/prisma/generated/client.js'
import { readFile, readdir } from 'fs/promises'
import path from 'path'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import redisMock from 'redis-mock'
import { promisify } from 'util'
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest'
import {
  mswServer,
  resetMswServer,
} from './src/core/__tests__/fixtures/server.fixture.js'

const pgClient = new PGlite()
const adapter = new PrismaPGlite(pgClient)

// Patch pglite-prisma-adapter's onError to map PostgreSQL error codes to typed
// DriverAdapterError kinds, matching what @prisma/adapter-pg does in production.
//
// In Prisma v6 the Rust query engine translated generic "postgres" errors into
// proper P-codes (P2002, P2003 …). In v7 the Rust engine is gone and the
// runtime relies on the adapter to provide typed kinds like
// "UniqueConstraintViolation" / "ForeignKeyConstraintViolation". The pglite
// adapter still sends kind:"postgres" for everything, so the runtime can't map
// them → errors leak as raw DriverAdapterErrors and our isPrismaError guards
// never match.
//
// Fix: intercept the DriverAdapterError the adapter already creates, mutate
// cause.kind to the correct value, and re-throw. No new class instances needed,
// no cross-module instanceof issues.
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

const redis = redisMock.createClient()
redis.get = promisify(redis.get.bind(redis)) as unknown as (typeof redis)['get']
redis.exists = promisify(
  redis.exists.bind(redis)
) as unknown as (typeof redis)['exists']
// Map raw PostgreSQL error codes to Prisma P-codes.
// With Prisma v7 + driver adapters, the runtime creates PrismaClientKnownRequestError
// instances but populates `code` with the raw PG code instead of the expected P-code.
// The onError patch above fixes `cause.kind` so the right error *class* is used,
// but the `code` property still leaks the PG code. We use `$extends` to translate
// it after the fact so that our `isPrismaError*` typeguards work.
const PG_TO_PRISMA_CODE: Record<string, string> = {
  '23505': 'P2002', // UniqueConstraintFailed
  '23503': 'P2003', // ForeignKeyConstraintFailed
  '22P02': 'P2023', // InconsistentColumnData
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
const prismaMigrationDir = path.join(
  import.meta.dirname,
  'prisma',
  'migrations'
)

type DelegateName = Prisma.TypeMap['meta']['modelProps']
type ModelDelegate = { count: (args: Record<string, never>) => Promise<number> }

// Prisma.ModelName is a generated runtime object: { User: 'User', Simulation: 'Simulation', ... }
// Convert each PascalCase name to its camelCase delegate key by lowercasing the first letter.

vi.mock('winston', async () => ({
  default: {
    ...(await vi.importActual('winston')),
    format: {
      combine: vi.fn(),
      colorize: vi.fn(),
      timestamp: vi.fn(),
      json: vi.fn(),
      errors: vi.fn(),
    },
    transports: {
      Console: vi.fn(),
    },
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    })),
  },
}))
vi.mock('./src/adapters/prisma/client', () => ({
  prisma,
}))
vi.mock('./src/adapters/redis/client', () => ({
  redis,
  redisClientFactory: () => redis,
}))
vi.mock('./src/features/authentication/authentication.service', async () => ({
  ...(await vi.importActual(
    './src/features/authentication/authentication.service'
  )),
  generateRandomVerificationCode: vi.fn(),
}))

const models = Object.values(Prisma.ModelName).map((modelName) => ({
  name: modelName,
  delegate: prisma[
    (modelName.charAt(0).toLowerCase() + modelName.slice(1)) as DelegateName
  ] as ModelDelegate,
}))

beforeAll(async () => {
  mswServer.listen({
    onUnhandledRequest(request, print) {
      const url = new URL(request.url)

      if (url.hostname === '127.0.0.1') {
        return
      }

      print.warning()
      print.error()
    },
  })

  const [migrationPaths] = await Promise.all([
    readdir(prismaMigrationDir),
    // Need to subscribe to redis channels
    import('./src/worker.js'),
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
  mswServer.close()
  await prisma.$disconnect()
  await pgClient.close()
  redis.quit()
})

afterEach(async () => {
  resetMswServer()

  await Promise.all([
    ...models.map(async ({ delegate, name }) => {
      try {
        expect(await delegate.count({})).toBe(0)
      } catch {
        console.warn(
          `${name} resources found after the test, please clean database after each test to avoid flaky tests`
        )
      }
    }),
    new Promise<void>((res, rej) =>
      redis.flushall((err) => (err ? rej(err) : res()))
    ),
  ])
})
