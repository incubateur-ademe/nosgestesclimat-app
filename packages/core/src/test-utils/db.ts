import { PGlite } from '@electric-sql/pglite'
import { readFile, readdir } from 'node:fs/promises'
import * as path from 'node:path'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import { Prisma, PrismaClient } from '../prisma/generated/client.ts'

type TestPrismaClient = ReturnType<typeof createPrismaClient>

interface TestDb {
  prisma: TestPrismaClient
  migrate(migrationsDir: string): Promise<void>
  teardown(): Promise<void>
}

export async function createTestDatabase(): Promise<TestDb> {
  const pgClient = new PGlite()
  const adapter = await createPGliteAdapter(pgClient)
  const prisma = createPrismaClient(adapter)

  async function migrate(migrationsDir: string) {
    const migrationPaths = await readdir(migrationsDir)

    await migrationPaths
      .filter((migrationPath) => migrationPath !== 'migration_lock.toml')
      .map((migrationPath) =>
        path.join(migrationsDir, migrationPath, 'migration.sql')
      )
      .reduce(async (promise, filename) => {
        // start reading…
        const migration = await readFile(filename, 'utf8')
        // …while previous migration resolves
        await promise
        await pgClient.exec(migration)
      }, Promise.resolve())
  }

  async function teardown() {
    await prisma.$disconnect()
    await pgClient.close()
  }

  return { prisma, migrate, teardown }
}

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
async function createPGliteAdapter(pgClient: PGlite) {
  const adapter = new PrismaPGlite(pgClient)
  const connectedAdapter = await adapter.connect()
  const baseProto = Object.getPrototypeOf(
    Object.getPrototypeOf(connectedAdapter)
  )
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
        throw driverError
      }
    }
  }

  patchJsonArrayResults(baseProto)

  return adapter
}

// PGlite deserializes the elements of a `json[]` / `jsonb[]` column into JS
// values, whereas the Prisma runtime expects each element as JSON *text* — that
// is what @prisma/adapter-pg returns, and the runtime `JSON.parse`s it back.
// Without this, reading a `Json[]` column holding plain strings (`foldedSteps`)
// throws `SyntaxError: … is not valid JSON`.
//
// Fix: re-serialize the elements of those columns on the way out, using the
// PostgreSQL type OIDs the driver already reports.
const JSON_ARRAY_TYPE_IDS = new Set([199, 3807]) // json[], jsonb[]

function patchJsonArrayResults(baseProto: {
  performIO: (query: unknown) => Promise<PGliteResults>
}) {
  const originalPerformIO = baseProto.performIO

  baseProto.performIO = async function (query: unknown) {
    const result = await originalPerformIO.call(this, query)

    const jsonArrayIndexes = result.fields.flatMap(({ dataTypeID }, index) =>
      JSON_ARRAY_TYPE_IDS.has(dataTypeID) ? [index] : []
    )

    if (jsonArrayIndexes.length === 0) {
      return result
    }

    for (const row of result.rows) {
      for (const index of jsonArrayIndexes) {
        const value = row[index]
        if (Array.isArray(value)) {
          row[index] = value.map((element) =>
            element === null ? null : JSON.stringify(element)
          )
        }
      }
    }

    return result
  }
}

// The rows are queried with `rowMode: 'array'`, hence the positional values.
interface PGliteResults {
  fields: { dataTypeID: number }[]
  rows: unknown[][]
}

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

function createPrismaClient(adapter: PrismaPGlite) {
  // @ts-expect-error : works with older @prisma/driver-adapter-utils
  const basePrisma = new PrismaClient({ adapter })

  return basePrisma.$extends({
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
}
