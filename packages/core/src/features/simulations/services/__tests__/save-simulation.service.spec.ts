import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'

import {
  ImmutableSimulationException,
  NotAuthorizedSimulationException,
  SimulationNotFoundException,
} from '../../exceptions/simulation.exception.ts'
import {
  createUser,
  simulationFactory,
} from '../../factories/simulation.factory.ts'
import { saveSimulation } from '../save-simulation.service.ts'

describe('saveSimulation', () => {
  afterEach(async () => {
    await Promise.all([
      prisma.simulationState.deleteMany(),
      prisma.simulation.deleteMany(),
      prisma.user.deleteMany(),
    ])
  })

  it('updates an existing simulation', async () => {
    const simulation = await simulationFactory.create()
    const updated = simulationFactory.build({ id: simulation.id })

    const result = await saveSimulation(simulation.userId, updated)

    expect(result.id).toBe(simulation.id)
    expect(result.progression).toBe(updated.progression)
  })

  it('stores a simulation state on update', async () => {
    const simulation = await simulationFactory.create()
    const updated = simulationFactory.build({ id: simulation.id })

    await saveSimulation(simulation.userId, updated)

    const states = await prisma.simulationState.findMany({
      where: { simulationId: simulation.id },
    })
    expect(states).toHaveLength(2)
  })

  it('throws SimulationNotFoundException when simulation does not exist', async () => {
    const userId = await createUser()
    const simulation = simulationFactory.build()

    await expect(saveSimulation(userId, simulation)).rejects.toThrow(
      SimulationNotFoundException
    )
  })

  it('throws NotAuthorizedSimulationException when user does not own the simulation', async () => {
    const simulation = await simulationFactory.create()
    const otherUserId = await createUser()
    const updated = simulationFactory.build({ id: simulation.id })

    await expect(saveSimulation(otherUserId, updated)).rejects.toThrow(
      NotAuthorizedSimulationException
    )
  })

  it('throws ImmutableSimulationException when downgrading a completed simulation', async () => {
    const simulation = await simulationFactory.create()
    const downgraded = simulationFactory.build({
      id: simulation.id,
      progression: 0.5,
    })

    await expect(saveSimulation(simulation.userId, downgraded)).rejects.toThrow(
      ImmutableSimulationException
    )
  })

  it('allows updating a completed simulation without changing progression', async () => {
    const simulation = await simulationFactory.create()
    const updated = simulationFactory.build({
      id: simulation.id,
      progression: 1,
    })

    await expect(
      saveSimulation(simulation.userId, updated)
    ).resolves.toBeDefined()
  })

  it('allows completing an incomplete simulation', async () => {
    const simulation = await simulationFactory.withProgression(0.5).create()
    const completed = simulationFactory.build({
      id: simulation.id,
      progression: 1,
    })

    await expect(
      saveSimulation(simulation.userId, completed)
    ).resolves.toBeDefined()
  })
})
