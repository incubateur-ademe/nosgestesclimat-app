import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { serializeModel } from '@nosgestesclimat/core/features/simulations/repository/model.mapper'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUserSession } from '@/services/auth/get-user-session'
import { mockAuthenticatedSession } from '../../../helpers/tests/mockAuthenticatedSession'
import { getCurrentSimulation } from '../get-current-simulation'

const serviceMock = vi.hoisted(() => ({
  getCurrentSimulation: vi.fn(),
}))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/simulations/services/get-current-simulation.service',
  () => ({
    getCurrentSimulation: serviceMock.getCurrentSimulation,
  })
)

describe('getCurrentSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns undefined when there is no session', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    const result = await getCurrentSimulation()

    expect(result).toBeUndefined()
    expect(serviceMock.getCurrentSimulation).not.toHaveBeenCalled()
  })

  it('returns undefined when the core service returns null', async () => {
    const userId = mockAuthenticatedSession()
    serviceMock.getCurrentSimulation.mockResolvedValue(null)

    const result = await getCurrentSimulation()

    expect(result).toBeUndefined()
    expect(serviceMock.getCurrentSimulation).toHaveBeenCalledWith({ userId })
  })

  it('maps the entity to a DTO', async () => {
    const userId = mockAuthenticatedSession()

    const entity = simulationFactory.withModelRegion('FR').build()
    serviceMock.getCurrentSimulation.mockResolvedValue(entity)

    const result = await getCurrentSimulation()

    expect(serviceMock.getCurrentSimulation).toHaveBeenCalledWith({ userId })
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
