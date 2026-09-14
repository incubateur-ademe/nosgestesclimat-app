import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { serializeModel } from '@nosgestesclimat/core/features/simulations/repository/model.mapper'
import { v4 as randomUUID } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUserSession } from '@/services/auth/get-user-session'
import { getPollParticipation } from '../get-poll-participation'

const serviceMock = vi.hoisted(() => ({
  getPollParticipation: vi.fn(),
}))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/simulations/services/get-poll-participation.service',
  () => ({
    getPollParticipation: serviceMock.getPollParticipation,
  })
)

describe('getPollParticipation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns undefined when there is no session', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    const result = await getPollParticipation('some-poll')

    expect(result).toBeUndefined()
    expect(serviceMock.getPollParticipation).not.toHaveBeenCalled()
  })

  it('returns undefined when the core service returns null', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    serviceMock.getPollParticipation.mockResolvedValue(null)

    const result = await getPollParticipation('some-poll')

    expect(result).toBeUndefined()
    expect(serviceMock.getPollParticipation).toHaveBeenCalledWith({
      userId,
      pollIdOrSlug: 'some-poll',
    })
  })

  it('maps the entity to a DTO', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })

    const entity = simulationFactory.withModelRegion('FR').build()
    serviceMock.getPollParticipation.mockResolvedValue(entity)

    const result = await getPollParticipation('some-poll')

    expect(serviceMock.getPollParticipation).toHaveBeenCalledWith({
      userId,
      pollIdOrSlug: 'some-poll',
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
