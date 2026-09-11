import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { emptyComputedResults } from '../../helpers/empty-computed-results.ts'
import { findSimulationById } from '../../repository/simulation.repository.ts'
import type { Model } from '../../types/model.ts'
import { startSimulation } from '../start-simulation.service.ts'

describe('startSimulation', () => {
  afterEach(async () => {
    await prisma.simulation.deleteMany()
    await prisma.user.deleteMany()
  })

  it('persists a pristine simulation owned by the user', async () => {
    const user = await userFactory.create()

    const { simulationId } = await startSimulation({ userId: user.id, model })

    expect(
      await findSimulationById({ id: simulationId, userId: user.id })
    ).toEqual({
      id: simulationId,
      date: expect.any(Date),
      model,
      progression: 0,
      situation: {},
      foldedSteps: [],
      computedResults: emptyComputedResults(),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      userId: user.id,
      polls: [],
      groups: [],
    })
  })

  it('starts a second simulation instead of overwriting the first', async () => {
    const user = await userFactory.create()

    const first = await startSimulation({ userId: user.id, model })
    const second = await startSimulation({ userId: user.id, model })

    expect(second.simulationId).not.toBe(first.simulationId)
    expect(await prisma.simulation.count({ where: { userId: user.id } })).toBe(
      2
    )
  })
})

const model: Model = {
  region: 'FR',
  locale: 'fr',
  version: { publishedTag: '4.16.1' },
}
