import { beforeEach, describe, expect, it, vi } from 'vitest'

import { simulationFactory } from '../../factories/simulation.factory.ts'
import { migrateSimulationIfNeeded } from '../migrate-simulation.ts'

vi.mock('@publicodes/tools/migration', () => ({
  migrateSituation: vi.fn(
    (situation: Record<string, unknown>) =>
      ({ ...situation, migrated: true }) as unknown
  ),
}))

const { migrateSituation } = await import('@publicodes/tools/migration')

describe('migrateSimulationIfNeeded', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('migrates the situation when the model uses an older published tag', () => {
    const simulation = simulationFactory
      .withModelRegion('FR')
      .withModelVersion({ publishedTag: '1.0.0' })
      .build()
    const originalSituation = simulation.situation

    const result = migrateSimulationIfNeeded(simulation)

    expect(migrateSituation).toHaveBeenCalledWith(
      originalSituation,
      expect.any(Object)
    )
    expect(result.situation).not.toBe(originalSituation)
  })

  it('does not migrate when the model is already on the current version', () => {
    const simulation = simulationFactory.withModelRegion('FR').build()

    const result = migrateSimulationIfNeeded(simulation)

    expect(migrateSituation).not.toHaveBeenCalled()
    expect(result).toBe(simulation)
  })

  it('does not migrate when the model uses a PR-based version', () => {
    const simulation = simulationFactory
      .withModelRegion('FR')
      .withModelVersion({ PRNumber: '42' })
      .build()

    const result = migrateSimulationIfNeeded(simulation)

    expect(migrateSituation).not.toHaveBeenCalled()
    expect(result).toBe(simulation)
  })

  it('mutates the situation in place and returns the same simulation instance', () => {
    const simulation = simulationFactory
      .withModelRegion('FR')
      .withModelVersion({ publishedTag: '1.0.0' })
      .build()
    const originalSituation = simulation.situation

    const result = migrateSimulationIfNeeded(simulation)

    expect(result).toBe(simulation)
    expect(simulation.situation).not.toBe(originalSituation)
  })
})
