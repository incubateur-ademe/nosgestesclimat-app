import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { SimulationStatus } from '../../../prisma/generated/client.ts'
import { createTestDatabase } from '../../../test-utils/db.ts'

const MIGRATIONS_DIR = path.join('.', 'prisma', 'migrations')

const simulations: { id: string; status: SimulationStatus }[] = [
  { id: '00000000-0000-0000-0000-000000000001', status: 'not_started' },
  {
    id: '00000000-0000-0000-0000-000000000002',
    status: 'answering_major_questions',
  },
  { id: '00000000-0000-0000-0000-000000000003', status: 'full_result_seen' },
]

const db = await createTestDatabase()

beforeAll(async () => {
  await db.migrate(MIGRATIONS_DIR)
  await db.prisma.simulation.createMany({
    data: simulations.map(({ id, status }) => ({
      id,
      date: new Date(),
      status,
      computedResults: {},
      situation: {},
      foldedSteps: [],
    })),
  })
})

afterAll(async () => {
  await db.teardown()
})

describe('simulation progression', () => {
  it('is no longer stored on the table', async () => {
    const columns = await db.prisma.$queryRawUnsafe<{ column_name: string }[]>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'ngc' AND table_name = 'Simulation'`
    )

    expect(columns.map(({ column_name }) => column_name)).not.toContain(
      'progression'
    )
  })

  it('is exposed by the warehouse view, derived from the status', async () => {
    const rows = await db.prisma.anonSimulation.findMany({
      select: { id: true, progression: true },
      orderBy: { id: 'asc' },
    })

    expect(rows).toEqual([
      { id: simulations[0].id, progression: 0 },
      { id: simulations[1].id, progression: 0.5 },
      { id: simulations[2].id, progression: 1 },
    ])
  })

  it('keeps the status on the computed results view', async () => {
    const rows = await db.prisma.$queryRawUnsafe<
      { id: string; progression: number; status: string }[]
    >(`SELECT "id", "progression", "status"::text AS "status"
       FROM "ngc"."ComputedResultsView"
       ORDER BY "id" ASC`)

    expect(rows).toEqual([
      { id: simulations[0].id, progression: 0, status: 'not_started' },
      {
        id: simulations[1].id,
        progression: 0.5,
        status: 'answering_major_questions',
      },
      { id: simulations[2].id, progression: 1, status: 'full_result_seen' },
    ])
  })

  it('counts only full-result simulations in the event computation', async () => {
    await db.prisma.event.create({
      data: {
        id: 'event-1',
        slug: 'event-1',
        name: 'Event',
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-12-31T23:59:59Z'),
      },
    })

    await db.prisma.simulation.createMany({
      data: [
        {
          id: '00000000-0000-0000-0000-000000000004',
          date: new Date('2024-06-01T00:00:00Z'),
          createdAt: new Date('2024-06-01T00:00:00Z'),
          status: 'full_result_seen',
          computedResults: {},
          situation: {},
          foldedSteps: [],
        },
        {
          id: '00000000-0000-0000-0000-000000000005',
          date: new Date('2024-06-02T00:00:00Z'),
          createdAt: new Date('2024-06-02T00:00:00Z'),
          status: 'answering_major_questions',
          computedResults: {},
          situation: {},
          foldedSteps: [],
        },
        {
          id: '00000000-0000-0000-0000-000000000006',
          date: new Date('2025-06-01T00:00:00Z'),
          createdAt: new Date('2025-06-01T00:00:00Z'),
          status: 'full_result_seen',
          computedResults: {},
          situation: {},
          foldedSteps: [],
        },
      ],
    })

    await db.prisma.$executeRawUnsafe(
      'REFRESH MATERIALIZED VIEW "ngc"."event_computation"'
    )

    const rows = await db.prisma.$queryRawUnsafe<
      { simulationsCount: number }[]
    >(`SELECT "simulationsCount" FROM "ngc"."event_computation"
       WHERE "eventId" = 'event-1' AND "organisationId" IS NULL`)

    expect(rows).toEqual([{ simulationsCount: 1 }])
  })
})
