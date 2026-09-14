import { pollFactory } from '@nosgestesclimat/core/features/polls/factories/poll.factory'
import type { PollResult } from '@nosgestesclimat/core/features/polls/services/get-poll-result.service'
import { computedResultsFactory } from '@nosgestesclimat/core/features/simulations/factories/computed-results.factory'
import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { v4 as randomUUID } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUserSession } from '@/services/auth/get-user-session'
import { getPollResult } from '../get-poll-result'

const serviceMock = vi.hoisted(() => ({
  getPollResultService: vi.fn(),
  isOrganisationAdministrator: vi.fn(),
}))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/polls/services/get-poll-result.service',
  () => ({
    getPollResult: serviceMock.getPollResultService,
  })
)

vi.mock(
  '@nosgestesclimat/core/features/organisations/services/is-organisation-administrator.service',
  () => ({
    isOrganisationAdministrator: serviceMock.isOrganisationAdministrator,
  })
)

const buildCoreResult = (): PollResult => ({
  poll: pollFactory.build(),
  cooldownSeconds: 0,
  participants: 3,
  results: null,
  userParticipation: null,
})

describe('getPollResult', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    serviceMock.getPollResultService.mockResolvedValue(buildCoreResult())
    serviceMock.isOrganisationAdministrator.mockResolvedValue(false)
  })

  it('calls notFound when the poll has no result to show', async () => {
    serviceMock.getPollResultService.mockResolvedValue(null)

    await expect(
      getPollResult({ organisationSlug: 'my-org', pollIdOrSlug: 'my-poll' })
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('has no viewer without a session', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    const result = await getPollResult({
      organisationSlug: 'my-org',
      pollIdOrSlug: 'my-poll',
    })

    expect(serviceMock.getPollResultService).toHaveBeenCalledWith({
      organisationSlug: 'my-org',
      pollIdOrSlug: 'my-poll',
      userId: null,
    })
    expect(serviceMock.isOrganisationAdministrator).not.toHaveBeenCalled()
    expect(result.isAdmin).toBe(false)
  })

  it('does not look for an administrator on an anonymous session', async () => {
    vi.mocked(getUserSession).mockResolvedValue({
      id: randomUUID(),
      isAuth: false,
    })

    const result = await getPollResult({
      organisationSlug: 'my-org',
      pollIdOrSlug: 'my-poll',
    })

    expect(serviceMock.isOrganisationAdministrator).not.toHaveBeenCalled()
    expect(result.isAdmin).toBe(false)
  })

  it('asks for the administrator right on a signed-in session', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    serviceMock.isOrganisationAdministrator.mockResolvedValue(true)

    const result = await getPollResult({
      organisationSlug: 'my-org',
      pollIdOrSlug: 'my-poll',
    })

    expect(serviceMock.getPollResultService).toHaveBeenCalledWith({
      organisationSlug: 'my-org',
      pollIdOrSlug: 'my-poll',
      userId,
    })
    expect(serviceMock.isOrganisationAdministrator).toHaveBeenCalledWith({
      organisationSlug: 'my-org',
      userEmail: 'alice@example.com',
    })
    expect(result.isAdmin).toBe(true)
  })

  it('exposes the core result as is', async () => {
    const userParticipation = simulationFactory.withModelRegion('FR').build()
    const results = {
      computedResults: computedResultsFactory.valid().build(),
      funFacts: null,
    }
    const coreResult: PollResult = {
      ...buildCoreResult(),
      results,
      userParticipation,
    }
    serviceMock.getPollResultService.mockResolvedValue(coreResult)

    const result = await getPollResult({
      organisationSlug: 'my-org',
      pollIdOrSlug: 'my-poll',
    })

    expect(result.poll).toEqual(coreResult.poll)
    expect(result.participants).toBe(3)
    expect(result.cooldownSeconds).toBe(0)
    expect(result.results).toEqual(results)
    expect(result.userParticipation).toEqual(userParticipation)
  })
})
