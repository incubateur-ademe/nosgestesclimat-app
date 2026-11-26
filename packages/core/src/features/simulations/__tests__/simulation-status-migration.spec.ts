import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestDatabase } from '../../../test-utils/db.ts'

const MIGRATIONS_DIR = path.join('.', 'prisma', 'migrations')
const STATUS_MIGRATION = '20261116170000_add_simulation_status'

const db = await createTestDatabase()

afterAll(async () => {
  await db.teardown()
})

describe('20261116170000_add_simulation_status', () => {
  beforeAll(async () => {
    // Replay the schema as it stood before the status column was introduced.
    await db.migrate(
      MIGRATIONS_DIR,
      (migration) => migration < STATUS_MIGRATION
    )

    await db.exec(`
      INSERT INTO "ngc"."Simulation" (
        "id",
        "date",
        "progression",
        "computedResults",
        "situation",
        "foldedSteps",
        "createdAt",
        "updatedAt"
      )
      VALUES
        (gen_random_uuid(), NOW(), 0, '{}'::jsonb, '{}'::jsonb, ARRAY[]::jsonb[], NOW(), NOW()),
        (gen_random_uuid(), NOW(), 0.5, '{}'::jsonb, '{}'::jsonb, ARRAY[]::jsonb[], NOW(), NOW()),
        (gen_random_uuid(), NOW(), 1, '{}'::jsonb, '{}'::jsonb, ARRAY[]::jsonb[], NOW(), NOW())
    `)

    await db.migrate(
      MIGRATIONS_DIR,
      (migration) => migration === STATUS_MIGRATION
    )
  })

  it('initializes status from the legacy progression value', async () => {
    // `progression` is dropped by a later migration, so it is not part of the
    // generated Prisma client: read the intermediate schema with raw SQL.
    const rows = await db.prisma.$queryRawUnsafe<
      { progression: number; status: string }[]
    >(`SELECT "progression", "status"::text AS "status"
       FROM "ngc"."Simulation"
       ORDER BY "progression" ASC`)

    expect(rows).toEqual([
      { progression: 0, status: 'not_started' },
      { progression: 0.5, status: 'answering_major_questions' },
      { progression: 1, status: 'full_result_seen' },
    ])
  })

  it('keeps a default status for instances still running the previous code', async () => {
    const [inserted] = await db.prisma.$queryRawUnsafe<
      { id: string; status: string }[]
    >(`INSERT INTO "ngc"."Simulation" (
         "id",
         "date",
         "progression",
         "computedResults",
         "situation",
         "foldedSteps",
         "createdAt",
         "updatedAt"
       )
       VALUES (
         gen_random_uuid(), NOW(), 0.25, '{}'::jsonb, '{}'::jsonb,
         ARRAY[]::jsonb[], NOW(), NOW()
       )
       RETURNING "id", "status"::text AS "status"`)

    expect(inserted?.status).toBe('not_started')
  })
})
