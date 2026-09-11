import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { computedResultsFactory } from '../../factories/computed-results.factory.ts'
import { emptyComputedResults } from '../../helpers/empty-computed-results.ts'
import { findSimulationById } from '../../repository/simulation.repository.ts'
import type { Model } from '../../types/model.ts'
import type { LegacySimulationInput } from '../import-legacy-local-simulations.service.ts'
import { importLegacyLocalSimulations } from '../import-legacy-local-simulations.service.ts'

describe('importLegacyLocalSimulations', () => {
  afterEach(async () => {
    await prisma.simulation.deleteMany()
    await prisma.user.deleteMany()
  })

  it('persists simulations without a model using the database default', async () => {
    const user = await userFactory.create()
    const simulation = buildLegacySimulation()

    await importLegacyLocalSimulations({
      userId: user.id,
      simulations: [simulation],
    })

    const row = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })

    expect(row).toEqual(
      expect.objectContaining({
        model: DATABASE_DEFAULT_MODEL,
        userId: user.id,
        progression: 1,
      })
    )
  })

  it('persists simulations that carry a model with the parsed model string', async () => {
    const user = await userFactory.create()
    const simulation = buildLegacySimulation({ model: 'FR-fr-1.2.3' })

    await importLegacyLocalSimulations({
      userId: user.id,
      simulations: [simulation],
    })

    const row = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })

    expect(row?.model).toEqual({
      region: 'FR',
      locale: 'fr',
      version: { publishedTag: '1.2.3' },
    })
  })

  it('skips simulations whose id already exists', async () => {
    const user = await userFactory.create()
    const simulation = buildLegacySimulation()

    await importLegacyLocalSimulations({
      userId: user.id,
      simulations: [simulation],
    })

    // Re-import the same id: should not throw and should not create a duplicate.
    await expect(
      importLegacyLocalSimulations({
        userId: user.id,
        simulations: [simulation],
      })
    ).resolves.toBeUndefined()

    expect(await prisma.simulation.count({ where: { userId: user.id } })).toBe(
      1
    )
  })

  it('does nothing when the array is empty', async () => {
    const user = await userFactory.create()

    await importLegacyLocalSimulations({
      userId: user.id,
      simulations: [],
    })

    expect(await prisma.simulation.count({ where: { userId: user.id } })).toBe(
      0
    )
  })

  it('persists an in-progress simulation with populated fields', async () => {
    const user = await userFactory.create()
    const situation = {
      'transport . voiture . km': 12000,
    } as unknown as Record<DottedName, number>
    const foldedSteps = ['transport . voiture . km'] as DottedName[]
    const computedResults = computedResultsFactory.valid().build()
    const simulation = buildLegacySimulation({
      progression: 0.5,
      situation,
      foldedSteps,
      computedResults,
    })

    await importLegacyLocalSimulations({
      userId: user.id,
      simulations: [simulation],
    })

    const row = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })

    expect(row).toEqual({
      id: simulation.id,
      date: new Date('2025-06-01'),
      model: DATABASE_DEFAULT_MODEL,
      progression: 0.5,
      situation,
      foldedSteps,
      computedResults,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      userId: user.id,
      polls: [],
      groups: [],
    })
  })
})

const DATABASE_DEFAULT_MODEL: Model = {
  region: 'FR',
  locale: 'fr',
  version: { publishedTag: '0.0.0' },
}

const buildLegacySimulation = (
  overrides: Partial<LegacySimulationInput> = {}
): LegacySimulationInput => ({
  id: crypto.randomUUID(),
  date: new Date('2025-06-01'),
  progression: 1,
  situation: {},
  foldedSteps: [],
  computedResults: emptyComputedResults(),
  ...overrides,
})
