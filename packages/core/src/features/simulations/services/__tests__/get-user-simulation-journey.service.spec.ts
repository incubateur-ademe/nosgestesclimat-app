import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { serializeModel } from '../../repository/model.mapper.ts'
import { getUserSimulationJourney } from '../get-user-simulation-journey.service.ts'

describe('getUserSimulationJourney', () => {
  afterEach(async () => {
    await prisma.simulation.deleteMany()
    await prisma.user.deleteMany()
  })

  it('returns undefined for both when the user has no simulations', async () => {
    const user = await userFactory.create()

    const result = await getUserSimulationJourney({ userId: user.id })

    expect(result).toEqual({})
  })

  it('returns the latest simulation as currentSimulation', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.2)
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
      })
      .create()
    const latest = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
      })
      .create()

    const result = await getUserSimulationJourney({ userId: user.id })

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
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
      })
      .create()
    const latestCompleted = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
      })
      .create()

    const result = await getUserSimulationJourney({ userId: user.id })

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
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
      })
      .create()
    const current = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
      })
      .create()

    const result = await getUserSimulationJourney({ userId: user.id })

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
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
      })
      .create()
    const completed = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
      })
      .create()

    const result = await getUserSimulationJourney({ userId: user.id })

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
      .withDeprecatedComputedResults()
      .params({ userId: user.id })
      .create()

    const result = await getUserSimulationJourney({ userId: user.id })

    expect(result).toEqual({})
  })

  it('excludes a completed simulation with invalid computedResults', async () => {
    const user = await userFactory.create()
    await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withDeprecatedComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
      })
      .create()
    const current = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
      })
      .create()

    const result = await getUserSimulationJourney({ userId: user.id })

    expect(result).toEqual({
      currentSimulation: {
        id: current.id,
        progression: 0.5,
        model: serializeModel(current.model),
      },
    })
  })

  it('excludes a completed simulation whose model string cannot be parsed', async () => {
    const user = await userFactory.create()
    const completed = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
      })
      .create()
    const current = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({
        userId: user.id,
        date: new Date('2024-02-01'),
      })
      .create()

    await prisma.simulation.update({
      where: { id: completed.id },
      data: { model: 'FR-de-1.2.3' },
    })

    const result = await getUserSimulationJourney({ userId: user.id })

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
      .withValidComputedResults()
      .params({ userId: other.id })
      .create()

    const result = await getUserSimulationJourney({ userId: user.id })

    expect(result).toEqual({})
  })

  it('excludes a simulation whose model string cannot be parsed', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .withValidComputedResults()
      .params({ userId: user.id })
      .create()

    await prisma.simulation.update({
      where: { id: simulation.id },
      data: { model: 'FR-de-1.2.3' },
    })

    const result = await getUserSimulationJourney({ userId: user.id })

    expect(result).toEqual({})
  })
})
