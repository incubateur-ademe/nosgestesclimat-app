import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { serializeModel } from '@nosgestesclimat/core/features/simulations/repository/model.mapper'
import { v4 as randomUUID } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NotFoundError, UnauthorizedError } from '@/helpers/server/error'
import { getUserSession } from '@/services/auth/get-user-session'
import { getSimulation } from '../get-simulation'

const serviceMock = vi.hoisted(() => ({
  getSimulation: vi.fn(),
}))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/simulations/services/get-simulation.service',
  () => ({
    getSimulation: serviceMock.getSimulation,
  })
)

describe('getSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws UnauthorizedError when there is no session', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    await expect(getSimulation(randomUUID())).rejects.toBeInstanceOf(
      UnauthorizedError
    )
    expect(serviceMock.getSimulation).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when the core service returns null', async () => {
    const userId = randomUUID()
    const simulationId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    serviceMock.getSimulation.mockResolvedValue(null)

    await expect(getSimulation(simulationId)).rejects.toBeInstanceOf(
      NotFoundError
    )
    expect(serviceMock.getSimulation).toHaveBeenCalledWith({
      id: simulationId,
      userId,
    })
  })

  it('maps the entity to a DTO', async () => {
    const userId = randomUUID()
    const simulationId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })

    const entity = simulationFactory.withModelRegion('FR').build()
    entity.id = simulationId
    serviceMock.getSimulation.mockResolvedValue(entity)

    const result = await getSimulation(simulationId)

    expect(serviceMock.getSimulation).toHaveBeenCalledWith({
      id: simulationId,
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
