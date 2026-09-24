import { pollFactory } from '@nosgestesclimat/core/features/polls/factories/poll.factory'
import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import type { Simulation } from '@nosgestesclimat/core/features/simulations/types/simulation'
import { v4 as randomUUID } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUserSession } from '@/services/auth/get-user-session'
import { getPollSummary } from '@/services/polls/get-poll-summary'
import { getPollParticipationOptions } from '../get-poll-participation-options'

const serviceMock = vi.hoisted(() => ({
  getPollParticipationOptions: vi.fn(),
}))

const notFoundMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const toSimulationDtoMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock('@/services/polls/get-poll-summary', () => ({
  getPollSummary: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/polls/services/get-poll-participation-options.service',
  () => ({
    getPollParticipationOptions: serviceMock.getPollParticipationOptions,
  })
)

vi.mock('@/services/simulations/simulation.dto', () => ({
  toSimulationDto: toSimulationDtoMock,
}))

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
  redirect: redirectMock,
}))

const poll = pollFactory.build()

describe('getPollParticipationOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    notFoundMock.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })
    redirectMock.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
    toSimulationDtoMock.mockImplementation((simulation: Simulation) => ({
      ...simulation,
      _dto: true,
    }))
    vi.mocked(getPollSummary).mockResolvedValue(poll)
  })

  it('calls notFound when the poll does not exist', async () => {
    vi.mocked(getPollSummary).mockResolvedValue(null)

    await expect(getPollParticipationOptions('unknown')).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
    expect(serviceMock.getPollParticipationOptions).not.toHaveBeenCalled()
  })

  it('returns early without calling the core service when there is no session', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    const result = await getPollParticipationOptions('poll-1')

    expect(result).toEqual({
      poll,
      currentPollSimulation: null,
      canReuseExistingSimulation: false,
    })
    expect(serviceMock.getPollParticipationOptions).not.toHaveBeenCalled()
  })

  it('redirects to the simulator when the current poll simulation is not completed', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      isAuth: false,
    })
    const inProgressSimulation = simulationFactory
      .withModelRegion('FR')
      .withProgression(0.5)
      .build()
    serviceMock.getPollParticipationOptions.mockResolvedValue({
      currentPollSimulation: inProgressSimulation,
      canReuseExistingSimulation: false,
    })

    await expect(getPollParticipationOptions('poll-1')).rejects.toThrow(
      'NEXT_REDIRECT'
    )
    expect(redirectMock).toHaveBeenCalledWith('/simulateur/bilan')
    expect(toSimulationDtoMock).not.toHaveBeenCalled()
  })

  it('returns the completed current poll simulation as a DTO without reuse', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      isAuth: false,
    })
    const completedSimulation = simulationFactory
      .withModelRegion('FR')
      .completed()
      .build()
    serviceMock.getPollParticipationOptions.mockResolvedValue({
      currentPollSimulation: completedSimulation,
      canReuseExistingSimulation: false,
    })

    const result = await getPollParticipationOptions('poll-1')

    expect(serviceMock.getPollParticipationOptions).toHaveBeenCalledWith({
      poll,
      userId,
    })
    expect(result).toEqual({
      poll,
      currentPollSimulation: { ...completedSimulation, _dto: true },
      canReuseExistingSimulation: false,
    })
  })

  it('returns the reusable simulation and its polls as DTOs when simulation is eligible', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      isAuth: false,
    })
    const reusableSimulation = simulationFactory
      .withModelRegion('FR')
      .completed()
      .build()
    const reusablePolls = [{ id: 'other-poll', name: 'Other', slug: 'other' }]
    serviceMock.getPollParticipationOptions.mockResolvedValue({
      currentPollSimulation: null,
      canReuseExistingSimulation: true,
      reusableSimulation,
      reusableSimulationPolls: reusablePolls,
    })

    const result = await getPollParticipationOptions('poll-1')

    expect(serviceMock.getPollParticipationOptions).toHaveBeenCalledWith({
      poll,
      userId,
    })
    expect(toSimulationDtoMock).toHaveBeenCalledWith(reusableSimulation)
    expect(result).toEqual({
      poll,
      currentPollSimulation: null,
      canReuseExistingSimulation: true,
      reusableSimulation: { ...reusableSimulation, _dto: true },
      reusableSimulationPolls: reusablePolls,
    })
  })
})
