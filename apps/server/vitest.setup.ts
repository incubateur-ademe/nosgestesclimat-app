import { Prisma } from '@nosgestesclimat/core/prisma/generated/client'
import { createTestDatabase } from '@nosgestesclimat/core/test-utils/db'
import { createRequire } from 'module'
import path from 'path'
import redisMock from 'redis-mock'
import { promisify } from 'util'
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest'
import {
  mswServer,
  resetMswServer,
} from './src/core/__tests__/fixtures/server.fixture.ts'

const db = await createTestDatabase()

const redis = redisMock.createClient()
redis.get = promisify(redis.get.bind(redis)) as unknown as (typeof redis)['get']
redis.exists = promisify(
  redis.exists.bind(redis)
) as unknown as (typeof redis)['exists']

const require = createRequire(import.meta.url)
const coreMain = require.resolve('@nosgestesclimat/core')
const prismaMigrationDir = path.join(
  path.dirname(coreMain),
  '..',
  'prisma',
  'migrations'
)

type DelegateName = Prisma.TypeMap['meta']['modelProps']
type ModelDelegate = { count: (args: Record<string, never>) => Promise<number> }

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
vi.mock('@nosgestesclimat/core/prisma/client', () => ({
  prisma: db.prisma,
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
  delegate: db.prisma[
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

  await Promise.all([import('./src/worker.js'), db.migrate(prismaMigrationDir)])
})

afterAll(async () => {
  mswServer.close()
  await db.teardown()
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
          `${String(name)} resources found after the test, please clean database after each test to avoid flaky tests`
        )
      }
    }),
    new Promise<void>((res, rej) =>
      redis.flushall((err) => (err ? rej(err) : res()))
    ),
  ])
})
