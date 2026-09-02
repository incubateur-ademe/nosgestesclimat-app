import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { v4 as randomUUID } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { parseModelString } from '@/helpers/server/model/models'
import { getUserSession } from '@/services/auth/get-user-session'
import { toSimulationDto } from '../simulation.dto'
import { updateSimulationSituation } from '../update-simulation-situation'
import type { UpdateSimulationSituationPayload } from '../update-simulation-situation-payload.schema'

const serviceMock = vi.hoisted(() => ({
  updateSimulationSituation: vi.fn(),
}))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/simulations/services/update-simulation-situation.service',
  () => ({
    updateSimulationSituation: serviceMock.updateSimulationSituation,
  })
)

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

vi.mock('next/navigation', () => ({
  unauthorized: () => {
    throw new Error('UNAUTHORIZED')
  },
}))

const aPayload = (
  overrides: Partial<UpdateSimulationSituationPayload> = {}
): UpdateSimulationSituationPayload => {
  const simulation = toSimulationDto(
    simulationFactory
      .withModelRegion('FR')
      .withModelVersion({ publishedTag: '1.2.3' })
      .withProgression(0.5)
      .params({ foldedSteps: ['transport . voiture . km'] })
      .build()
  )
  simulation.computedResults.carbone.bilan = 1000

  const { id, model, situation, foldedSteps, progression, computedResults } =
    simulation
  return {
    id,
    model,
    situation: situation as UpdateSimulationSituationPayload['situation'],
    foldedSteps,
    progression,
    computedResults,
    ...overrides,
  }
}

describe('updateSimulationSituation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    serviceMock.updateSimulationSituation.mockResolvedValue({ success: true })
  })

  it('calls unauthorized when there is no session', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    await expect(updateSimulationSituation(aPayload())).rejects.toThrow(
      'UNAUTHORIZED'
    )
    expect(serviceMock.updateSimulationSituation).not.toHaveBeenCalled()
  })

  it('forwards the session user and the answered fields to the core service', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    const payload = aPayload()

    const result = await updateSimulationSituation(payload)

    expect(serviceMock.updateSimulationSituation).toHaveBeenCalledWith({
      userId,
      simulationId: payload.id,
      situation: payload.situation,
      foldedSteps: payload.foldedSteps,
      progression: 0.5,
      computedResults: payload.computedResults,
      model: 'FR-fr-1.2.3',
    })
    expect(result).toEqual({ success: true })
  })

  it('passes the core failure through', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    const failure = {
      success: false,
      error: { code: 'simulation_completed' },
    }
    serviceMock.updateSimulationSituation.mockResolvedValue(failure)

    const result = await updateSimulationSituation(aPayload())

    expect(result).toEqual(failure)
  })

  it('repairs an unparseable model before writing', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    const payload = aPayload()
    delete payload.model

    await updateSimulationSituation(payload)

    const [[written]] = serviceMock.updateSimulationSituation.mock.calls as [
      { model?: string },
    ][]
    expect(parseModelString(written.model ?? '')).not.toBeNull()
    expect(written.model).not.toBe('FR-fr-0.0.0')
  })

  it('rejects a malformed payload without reaching the core service', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    const payload = aPayload({ id: 'not-a-uuid' })

    const result = await updateSimulationSituation(payload)

    expect(result).toMatchObject({
      success: false,
      error: { code: 'invalid_payload' },
    })
    expect(serviceMock.updateSimulationSituation).not.toHaveBeenCalled()
  })
})
