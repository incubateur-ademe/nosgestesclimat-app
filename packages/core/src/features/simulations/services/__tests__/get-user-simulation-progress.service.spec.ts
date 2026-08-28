import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { serializeModel } from '../../repository/model.mapper.ts'
import { getUserSimulationProgress } from '../get-user-simulation-progress.service.ts'

const validComputedResults = {
  carbone: {
    bilan: 1000,
    categories: {
      alimentation: 300,
      transport: 400,
      logement: 200,
      divers: 50,
      'services sociétaux': 50,
    },
    subcategories: {},
  },
  eau: {
    bilan: 500,
    categories: {
      alimentation: 150,
      transport: 200,
      logement: 100,
      divers: 25,
      'services sociétaux': 25,
    },
    subcategories: {},
  },
}

describe('getUserSimulationProgress', () => {
  afterEach(async () => {
    await prisma.simulation.deleteMany()
    await prisma.user.deleteMany()
  })

  it('returns undefined for both when the user has no simulations', async () => {
    const user = await userFactory.create()

    const result = await getUserSimulationProgress({ userId: user.id })

    expect(result).toEqual({})
  })

  it('returns the latest simulation as currentSimulation', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.2)
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
        computedResults: validComputedResults,
      })
      .create()
    const latest = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
        computedResults: validComputedResults,
      })
      .create()

    const result = await getUserSimulationProgress({ userId: user.id })

    expect(result).toEqual({
      currentSimulation: {
        id: latest.id,
        progression: 0.5,
        model: serializeModel(latest.model),
      },
    })
  })

  it('returns the latest completed simulation as completedSimulation', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withModelRegion('FR')
      .completed()
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
        computedResults: validComputedResults,
      })
      .create()
    const latestCompleted = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
        computedResults: validComputedResults,
      })
      .create()

    const result = await getUserSimulationProgress({ userId: user.id })

    expect(result).toEqual({
      currentSimulation: {
        id: latestCompleted.id,
        progression: 1,
        model: serializeModel(latestCompleted.model),
      },
      completedSimulation: {
        id: latestCompleted.id,
        progression: 1,
        model: serializeModel(latestCompleted.model),
      },
    })
  })

  it('returns distinct simulations when the latest one is still in progress', async () => {
    const user = await userFactory.create()
    const completed = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
        computedResults: validComputedResults,
      })
      .create()
    const current = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
        computedResults: validComputedResults,
      })
      .create()

    const result = await getUserSimulationProgress({ userId: user.id })

    expect(result).toEqual({
      currentSimulation: {
        id: current.id,
        progression: 0.5,
        model: serializeModel(current.model),
      },
      completedSimulation: {
        id: completed.id,
        progression: 1,
        model: serializeModel(completed.model),
      },
    })
  })

  it('ignores an older in progress simulation when the latest one is completed', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
        computedResults: validComputedResults,
      })
      .create()
    const completed = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
        computedResults: validComputedResults,
      })
      .create()

    const result = await getUserSimulationProgress({ userId: user.id })

    expect(result).toEqual({
      currentSimulation: {
        id: completed.id,
        progression: 1,
        model: serializeModel(completed.model),
      },
      completedSimulation: {
        id: completed.id,
        progression: 1,
        model: serializeModel(completed.model),
      },
    })
  })

  it('excludes simulations whose computedResults do not match the current shape', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withProgression(0.5)
      .params({ userId: user.id, computedResults: { bilan: 1000 } })
      .create()

    const result = await getUserSimulationProgress({ userId: user.id })

    expect(result).toEqual({})
  })

  it('excludes a completed simulation with invalid computedResults', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withModelRegion('FR')
      .completed()
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
        computedResults: {},
      })
      .create()
    const current = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
        computedResults: validComputedResults,
      })
      .create()

    const result = await getUserSimulationProgress({ userId: user.id })

    expect(result).toEqual({
      currentSimulation: {
        id: current.id,
        progression: 0.5,
        model: serializeModel(current.model),
      },
    })
  })

  it('does not return another user simulations', async () => {
    const user = await userFactory.create()
    const other = await userFactory.create()
    await simulationFactory
      .withProgression(0.5)
      .params({ userId: other.id, computedResults: validComputedResults })
      .create()

    const result = await getUserSimulationProgress({ userId: user.id })

    expect(result).toEqual({})
  })
})
