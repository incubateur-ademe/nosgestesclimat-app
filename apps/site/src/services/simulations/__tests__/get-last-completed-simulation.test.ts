import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { serializeModel } from '@nosgestesclimat/core/features/simulations/repository/model.mapper'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUserSession } from '@/services/auth/get-user-session'
import { mockAuthenticatedSession } from '../../../helpers/tests/mockAuthenticatedSession'
import { getLastCompletedSimulation } from '../get-last-completed-simulation'

const serviceMock = vi.hoisted(() => ({
  getLastCompletedSimulation: vi.fn(),
}))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/simulations/services/get-last-completed-simulation.service',
  () => ({
    getLastCompletedSimulation: serviceMock.getLastCompletedSimulation,
  })
)

describe('getLastCompletedSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns undefined when there is no session', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    const result = await getLastCompletedSimulation()

    expect(result).toBeUndefined()
    expect(serviceMock.getLastCompletedSimulation).not.toHaveBeenCalled()
  })

  it('returns undefined when the core service returns null', async () => {
    const userId = mockAuthenticatedSession()
    serviceMock.getLastCompletedSimulation.mockResolvedValue(null)

    const result = await getLastCompletedSimulation()

    expect(result).toBeUndefined()
    expect(serviceMock.getLastCompletedSimulation).toHaveBeenCalledWith({
      userId,
    })
  })

  it('maps the entity to a DTO', async () => {
    const userId = mockAuthenticatedSession()

    const entity = simulationFactory.withModelRegion('FR').completed().build()
    serviceMock.getLastCompletedSimulation.mockResolvedValue(entity)

    const result = await getLastCompletedSimulation()

    expect(serviceMock.getLastCompletedSimulation).toHaveBeenCalledWith({
      userId,
    })
    expect(result).toEqual({
      id: entity.id,
      date: entity.date.toISOString(),
      situation: entity.situation,
      foldedSteps: entity.foldedSteps,
      computedResults: entity.computedResults,
      progression: entity.progression,
      model: serializeModel(entity.model),
      updatedAt: entity.updatedAt.toISOString(),
    })
  })
})
