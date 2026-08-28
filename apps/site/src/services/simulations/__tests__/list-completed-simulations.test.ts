import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { serializeModel } from '@nosgestesclimat/core/features/simulations/repository/model.mapper'
import { v4 as randomUUID } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getInitialExtendedSituation } from '@/helpers/modelFetching/getInitialExtendedSituation'
import { getUserSession } from '@/services/auth/get-user-session'
import { listCompletedSimulations } from '../list-completed-simulations'

const serviceMock = vi.hoisted(() => ({
  listCompletedSimulations: vi.fn(),
}))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/simulations/services/list-completed-simulations.service',
  () => ({
    listCompletedSimulations: serviceMock.listCompletedSimulations,
  })
)

describe('listCompletedSimulations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an empty array when there is no session', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    const result = await listCompletedSimulations()

    expect(result).toEqual([])
    expect(serviceMock.listCompletedSimulations).not.toHaveBeenCalled()
  })

  it('returns an empty array when the core service returns no simulations', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    serviceMock.listCompletedSimulations.mockResolvedValue([])

    const result = await listCompletedSimulations()

    expect(result).toEqual([])
    expect(serviceMock.listCompletedSimulations).toHaveBeenCalledWith({
      userId,
      limit: undefined,
    })
  })

  it('maps entities to DTOs and applies migration to the latest simulation', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })

    const [older, newer] = [
      simulationFactory.withModelRegion('FR').build(),
      simulationFactory.withModelRegion('FR').build(),
    ]
    serviceMock.listCompletedSimulations.mockResolvedValue([newer, older])

    const result = await listCompletedSimulations()

    expect(serviceMock.listCompletedSimulations).toHaveBeenCalledWith({
      userId,
      limit: undefined,
    })
    expect(result).toEqual([
      {
        id: newer.id,
        date: newer.date.toISOString(),
        situation: newer.situation,
        extendedSituation: getInitialExtendedSituation(),
        foldedSteps: newer.foldedSteps,
        actionChoices: newer.actionChoices,
        computedResults: newer.computedResults,
        progression: newer.progression,
        model: serializeModel(newer.model),
        updatedAt: newer.updatedAt.toISOString(),
      },
      {
        id: older.id,
        date: older.date.toISOString(),
        situation: older.situation,
        extendedSituation: getInitialExtendedSituation(),
        foldedSteps: older.foldedSteps,
        actionChoices: older.actionChoices,
        computedResults: older.computedResults,
        progression: older.progression,
        model: serializeModel(older.model),
        updatedAt: older.updatedAt.toISOString(),
      },
    ])
  })

  it('forwards the limit to the core service', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    serviceMock.listCompletedSimulations.mockResolvedValue([])

    await listCompletedSimulations({ limit: 2 })

    expect(serviceMock.listCompletedSimulations).toHaveBeenCalledWith({
      userId,
      limit: 2,
    })
  })
})
