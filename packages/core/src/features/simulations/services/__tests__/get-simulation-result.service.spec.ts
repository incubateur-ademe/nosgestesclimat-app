import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'

import { NoCompletedSimulationForUserException } from '../../exceptions/simulation-result.exception.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { getSimulationResult } from '../get-simulation-result.service.ts'

const buildComputedResults = (bilan: number) => ({
  carbone: {
    bilan,
    categories: {
      alimentation: bilan * 0.2,
      transport: bilan * 0.3,
      logement: bilan * 0.25,
      divers: bilan * 0.15,
      'services sociétaux': bilan * 0.1,
    },
    subcategories: {},
  },
  eau: {
    bilan: 100,
    categories: {
      alimentation: 20,
      transport: 30,
      logement: 25,
      divers: 15,
      'services sociétaux': 10,
    },
    subcategories: {},
  },
})

describe('getSimulationResult', () => {
  afterEach(async () => {
    await Promise.all([
      prisma.simulationState.deleteMany(),
      prisma.simulation.deleteMany(),
      prisma.user.deleteMany(),
    ])
  })

  it('returns the latest completed simulation result with tendency', async () => {
    await simulationFactory
      .withComputedResults(buildComputedResults(10000))
      .create()
    const newer = await simulationFactory
      .withComputedResults(buildComputedResults(5000))
      .create()

    const result = await getSimulationResult(newer.userId, {
      withTendency: true,
    })

    expect(result.computedResults.carbone.bilan).toBe(5000)
    expect(result.tendency).toBe('decrease')
    expect(result.hasPreviousResult).toBe(true)
  })

  it('does not set tendency when only one simulation exists', async () => {
    const simulation = await simulationFactory.create()

    const result = await getSimulationResult(simulation.userId)

    expect(result.tendency).toBeUndefined()
    expect(result.hasPreviousResult).toBe(false)
  })

  it('reports an increase tendency when carbon goes up', async () => {
    await simulationFactory
      .withComputedResults(buildComputedResults(5000))
      .create()
    const newer = await simulationFactory
      .withComputedResults(buildComputedResults(10000))
      .create()

    const result = await getSimulationResult(newer.userId, {
      withTendency: true,
    })

    expect(result.tendency).toBe('increase')
    expect(result.hasPreviousResult).toBe(true)
  })

  it('throws when no completed simulation exists', async () => {
    const simulation = await simulationFactory.withProgression(0).create()

    await expect(getSimulationResult(simulation.userId)).rejects.toThrow(
      NoCompletedSimulationForUserException
    )
  })
})
