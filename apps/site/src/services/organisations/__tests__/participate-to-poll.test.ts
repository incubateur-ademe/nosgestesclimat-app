import type { AppUser } from '@nosgestesclimat/core/features/auth/types/user-session'
import { PollNotFoundError } from '@nosgestesclimat/core/features/polls/errors/polls.error'
import { failure, success } from '@nosgestesclimat/core/lib/result'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Model } from '@/helpers/server/model/models'
import { participateToPoll } from '../participate-to-poll'

const serviceMock = vi.hoisted(() => ({
  participateToPoll: vi.fn(),
}))

const sessionMock = vi.hoisted(() => ({
  ensureUserSession: vi.fn(),
}))

vi.mock('@/services/auth/ensure-user-session', () => ({
  ensureUserSession: sessionMock.ensureUserSession,
}))

vi.mock(
  '@nosgestesclimat/core/features/polls/services/participate-to-poll.service',
  () => ({
    createParticipateToPoll: vi.fn(() => serviceMock.participateToPoll),
  })
)

vi.mock('@/adapters/brevoClient', () => ({
  sendEmail: vi.fn(),
}))

vi.mock('next/server', () => ({
  after: vi.fn(),
}))

const pollId = crypto.randomUUID()
const unknownPollId = crypto.randomUUID()
const simulationId = crypto.randomUUID()
const reusedSimulationId = crypto.randomUUID()

const authUser: AppUser = {
  id: crypto.randomUUID(),
  email: 'alice@example.com',
  isAuth: true,
}

const anonUser: AppUser = {
  id: crypto.randomUUID(),
  isAuth: false,
}

const model: Model = {
  locale: 'fr',
  region: 'FR',
  version: { publishedTag: '1.0.0' },
}

describe('participateToPoll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('forwards a new-model participation to the core service', async () => {
    sessionMock.ensureUserSession.mockResolvedValue(authUser)
    serviceMock.participateToPoll.mockResolvedValue(success({ simulationId }))

    const result = await participateToPoll({
      pollId,
      locale: 'fr',
      model,
    })

    expect(result).toEqual(success({ simulationId }))
    expect(serviceMock.participateToPoll).toHaveBeenCalledWith({
      userSession: authUser,
      pollId,
      locale: 'fr',
      model,
    })
  })

  it('forwards a reuse-simulation participation to the core service', async () => {
    sessionMock.ensureUserSession.mockResolvedValue(authUser)
    serviceMock.participateToPoll.mockResolvedValue(
      success({ simulationId: reusedSimulationId })
    )

    const result = await participateToPoll({
      pollId,
      locale: 'fr',
      reuseSimulationId: reusedSimulationId,
    })

    expect(result).toEqual(success({ simulationId: reusedSimulationId }))
    expect(serviceMock.participateToPoll).toHaveBeenCalledWith({
      userSession: authUser,
      pollId,
      locale: 'fr',
      reuseSimulationId: reusedSimulationId,
    })
  })

  it('propagates an error from the service as-is', async () => {
    sessionMock.ensureUserSession.mockResolvedValue(authUser)
    const error = new PollNotFoundError()
    serviceMock.participateToPoll.mockResolvedValue(failure(error))

    const result = await participateToPoll({
      pollId: unknownPollId,
      locale: 'fr',
      model,
    })

    expect(result).toEqual(failure(error))
  })

  it.each([
    { description: 'an existing user', userSession: authUser },
    { description: 'a new user', userSession: anonUser },
  ])(
    'calls ensureUserSession and forwards its session to the service for $description',
    async ({ userSession }) => {
      sessionMock.ensureUserSession.mockResolvedValue(userSession)
      serviceMock.participateToPoll.mockResolvedValue(success({ simulationId }))

      await participateToPoll({
        pollId,
        locale: 'fr',
        model,
      })

      expect(sessionMock.ensureUserSession).toHaveBeenCalledTimes(1)
      expect(serviceMock.participateToPoll).toHaveBeenCalledWith({
        userSession,
        pollId,
        locale: 'fr',
        model,
      })
    }
  )
})
