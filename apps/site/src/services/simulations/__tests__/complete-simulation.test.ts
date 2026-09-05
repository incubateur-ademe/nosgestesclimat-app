import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { v4 as randomUUID } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  EMAIL_PAGE_PATH,
  END_PAGE_PATH,
  GROUP_RESULTS_ROUTE_PATTERN,
} from '@/constants/urls/paths'
import { getUserSession } from '@/services/auth/get-user-session'
import { completeSimulation } from '../complete-simulation'
import type { CompleteSimulationPayload } from '../complete-simulation-payload.schema'
import { toSimulationDto } from '../simulation.dto'

const serviceMock = vi.hoisted(() => ({
  completeSimulation: vi.fn(),
}))

const nextMock = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  after: vi.fn(),
}))

vi.mock('@/adapters/brevoClient', () => ({
  sendEmail: vi.fn(),
  addOrUpdateContact: vi.fn(),
}))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/simulations/services/complete-simulation.service',
  () => ({
    createCompleteSimulation: vi.fn(() => serviceMock.completeSimulation),
  })
)

vi.mock('next/cache', () => ({
  revalidatePath: nextMock.revalidatePath,
}))

vi.mock('next/server', () => ({
  after: nextMock.after,
}))

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve(
      new Map([
        ['x-region', JSON.stringify({ current: 'FR', initial: 'FR' })],
        ['x-next-i18n-router-locale', 'fr'],
      ])
    ),
  cookies: () => Promise.resolve(new Map()),
}))

// The real `redirect` throws to interrupt the action: the mock must do the same
// or the code after it would keep running.
vi.mock('next/navigation', () => ({
  unauthorized: () => {
    throw new Error('UNAUTHORIZED')
  },
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`)
  },
}))

describe('completeSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    serviceMock.completeSimulation.mockResolvedValue({
      success: true,
      data: {},
    })
  })

  it('calls unauthorized when there is no session', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    await expect(completeSimulation(aPayload())).rejects.toThrow('UNAUTHORIZED')
    expect(serviceMock.completeSimulation).not.toHaveBeenCalled()
    expect(nextMock.revalidatePath).not.toHaveBeenCalled()
  })

  it('rejects a malformed payload without reaching the core service', async () => {
    vi.mocked(getUserSession).mockResolvedValue(aSession())

    const result = await completeSimulation(aPayload({ id: 'not-a-uuid' }))

    expect(result).toMatchObject({
      success: false,
      error: { code: 'invalid_payload' },
    })
    expect(serviceMock.completeSimulation).not.toHaveBeenCalled()
    expect(nextMock.revalidatePath).not.toHaveBeenCalled()
  })

  it('rejects an unfinished simulation without reaching the core service', async () => {
    vi.mocked(getUserSession).mockResolvedValue(aSession())

    const result = await completeSimulation(
      aPayload({ progression: 0.5 as CompleteSimulationPayload['progression'] })
    )

    expect(result).toMatchObject({
      success: false,
      error: { code: 'invalid_payload' },
    })
    expect(serviceMock.completeSimulation).not.toHaveBeenCalled()
  })

  it('forwards the session, the answers and the locale to the core service', async () => {
    const session = aSession()
    vi.mocked(getUserSession).mockResolvedValue(session)
    const payload = aPayload()

    await expect(completeSimulation(payload)).rejects.toThrow(
      `REDIRECT:${END_PAGE_PATH}`
    )

    expect(serviceMock.completeSimulation).toHaveBeenCalledWith({
      userSession: session,
      simulationId: payload.id,
      progression: 1,
      situation: payload.situation,
      foldedSteps: payload.foldedSteps,
      computedResults: payload.computedResults,
      locale: 'fr',
    })
    expect(nextMock.revalidatePath).toHaveBeenCalledWith(
      END_PAGE_PATH,
      'layout'
    )
  })

  it('passes the core failure through without redirecting nor revalidating', async () => {
    vi.mocked(getUserSession).mockResolvedValue(aSession())
    const failure = {
      success: false,
      error: { code: 'simulation_completed' },
    }
    serviceMock.completeSimulation.mockResolvedValue(failure)

    const result = await completeSimulation(aPayload())

    expect(result).toEqual(failure)
    expect(nextMock.revalidatePath).not.toHaveBeenCalled()
  })

  it('revalidates the group results page when the simulation belongs to a group', async () => {
    vi.mocked(getUserSession).mockResolvedValue(aSession())
    serviceMock.completeSimulation.mockResolvedValue({
      success: true,
      data: { groups: [{ id: randomUUID() }], polls: [] },
    })

    await expect(completeSimulation(aPayload())).rejects.toThrow(
      `REDIRECT:${END_PAGE_PATH}`
    )

    expect(nextMock.revalidatePath).toHaveBeenCalledWith(
      GROUP_RESULTS_ROUTE_PATTERN,
      'page'
    )
  })

  it('does not revalidate the group results page without a group', async () => {
    vi.mocked(getUserSession).mockResolvedValue(aSession())
    serviceMock.completeSimulation.mockResolvedValue({
      success: true,
      data: { groups: [], polls: [{ id: randomUUID() }] },
    })

    await expect(completeSimulation(aPayload())).rejects.toThrow(
      `REDIRECT:${END_PAGE_PATH}`
    )

    expect(nextMock.revalidatePath).not.toHaveBeenCalledWith(
      GROUP_RESULTS_ROUTE_PATTERN,
      'page'
    )
  })

  it('asks an anonymous user for their email when the simulation is in a poll', async () => {
    vi.mocked(getUserSession).mockResolvedValue(aSession({ isAuth: false }))
    serviceMock.completeSimulation.mockResolvedValue({
      success: true,
      data: { groups: [], polls: [{ id: randomUUID() }] },
    })

    await expect(completeSimulation(aPayload())).rejects.toThrow(
      `REDIRECT:${EMAIL_PAGE_PATH}`
    )
  })

  it('asks an anonymous user for their email when the simulation is in a group', async () => {
    vi.mocked(getUserSession).mockResolvedValue(aSession({ isAuth: false }))
    serviceMock.completeSimulation.mockResolvedValue({
      success: true,
      data: { groups: [{ id: randomUUID() }], polls: [] },
    })

    await expect(completeSimulation(aPayload())).rejects.toThrow(
      `REDIRECT:${EMAIL_PAGE_PATH}`
    )
  })

  it('sends an anonymous user to the end page when the simulation is not shared', async () => {
    vi.mocked(getUserSession).mockResolvedValue(aSession({ isAuth: false }))
    serviceMock.completeSimulation.mockResolvedValue({
      success: true,
      data: { groups: [], polls: [] },
    })

    await expect(completeSimulation(aPayload())).rejects.toThrow(
      `REDIRECT:${END_PAGE_PATH}`
    )
  })

  it('sends a verified user to the end page even when the simulation is shared', async () => {
    vi.mocked(getUserSession).mockResolvedValue(aSession())
    serviceMock.completeSimulation.mockResolvedValue({
      success: true,
      data: { groups: [{ id: randomUUID() }], polls: [{ id: randomUUID() }] },
    })

    await expect(completeSimulation(aPayload())).rejects.toThrow(
      `REDIRECT:${END_PAGE_PATH}`
    )
  })
})

const aPayload = (
  overrides: Partial<CompleteSimulationPayload> = {}
): CompleteSimulationPayload => {
  const simulation = toSimulationDto(
    simulationFactory
      .completed()
      .params({ foldedSteps: ['transport . voiture . km'] })
      .build()
  )
  simulation.computedResults.carbone.bilan = 1000

  const { id, situation, foldedSteps, computedResults } = simulation
  return {
    id,
    progression: 1,
    situation: situation as CompleteSimulationPayload['situation'],
    foldedSteps,
    computedResults,
    ...overrides,
  }
}

const aSession = (overrides: { isAuth?: boolean } = {}) => ({
  id: randomUUID(),
  email: 'alice@example.com',
  isAuth: true,
  ...overrides,
})
