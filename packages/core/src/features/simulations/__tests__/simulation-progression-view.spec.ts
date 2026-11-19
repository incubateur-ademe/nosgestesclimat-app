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
  {
    id: '00000000-0000-0000-0000-000000000003',
    status: 'major_questions_result_seen',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    status: 'answering_minor_questions',
  },
  { id: '00000000-0000-0000-0000-000000000005', status: 'full_result_seen' },
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
      { id: simulations[3].id, progression: 0.5 },
      { id: simulations[4].id, progression: 1 },
    ])
  })
})
