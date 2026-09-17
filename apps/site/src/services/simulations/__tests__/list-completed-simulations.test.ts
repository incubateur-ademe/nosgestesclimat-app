import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUserSession } from '@/services/auth/get-user-session'
import { mockAuthenticatedSession } from '../../../helpers/tests/mockAuthenticatedSession'
import { listCompletedSimulations } from '../list-completed-simulations'
import { toSimulationDto } from '../simulation.dto'

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
    const userId = mockAuthenticatedSession()
    serviceMock.listCompletedSimulations.mockResolvedValue([])

    const result = await listCompletedSimulations()

    expect(result).toEqual([])
    expect(serviceMock.listCompletedSimulations).toHaveBeenCalledWith({
      userId,
      limit: undefined,
    })
  })

  it('maps entities to DTOs', async () => {
    const userId = mockAuthenticatedSession()

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
    expect(result).toEqual([newer, older].map(toSimulationDto))
  })

  it('forwards the limit to the core service', async () => {
    const userId = mockAuthenticatedSession()
    serviceMock.listCompletedSimulations.mockResolvedValue([])

    await listCompletedSimulations({ limit: 2 })

    expect(serviceMock.listCompletedSimulations).toHaveBeenCalledWith({
      userId,
      limit: 2,
    })
  })
})
