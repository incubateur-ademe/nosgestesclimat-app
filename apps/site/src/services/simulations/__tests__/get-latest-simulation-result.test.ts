import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import type { SimulationResult } from '@nosgestesclimat/core/features/simulations/services/get-simulation-result.service'
import { v4 as randomUUID } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUserSession } from '@/services/auth/get-user-session'
import { getLatestSimulationResult } from '../get-latest-simulation-result'

const serviceMock = vi.hoisted(() => ({
  getLatestSimulationResultService: vi.fn(),
}))

const notFoundMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/simulations/services/get-latest-simulation-result.service',
  () => ({
    getLatestSimulationResult: serviceMock.getLatestSimulationResultService,
  })
)

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}))

describe('getLatestSimulationResult', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    notFoundMock.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })
  })

  it('calls notFound when there is no session', async () => {
    vi.mocked(getUserSession).mockResolvedValue(null)

    await expect(
      getLatestSimulationResult({ withTendency: false })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(serviceMock.getLatestSimulationResultService).not.toHaveBeenCalled()
  })

  it('calls notFound when the core service returns null', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })
    serviceMock.getLatestSimulationResultService.mockResolvedValue(null)

    await expect(
      getLatestSimulationResult({ withTendency: false })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(serviceMock.getLatestSimulationResultService).toHaveBeenCalledWith({
      withTendency: false,
      userId,
    })
  })

  it('forwards withTendency: false and returns a plain SimulationResult with null group', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })

    const entity = simulationFactory.withModelRegion('FR').build()
    const coreResult: SimulationResult = {
      simulation: entity,
      group: null,
      tendency: null,
    }
    serviceMock.getLatestSimulationResultService.mockResolvedValue(coreResult)

    const result = await getLatestSimulationResult({ withTendency: false })

    expect(result).not.toBeNull()
    expect(result.group).toBeNull()
    expect(result.tendency).toBeNull()
    expect(result.simulation.computedResults).toEqual(entity.computedResults)
    expect(serviceMock.getLatestSimulationResultService).toHaveBeenCalledWith({
      withTendency: false,
      userId,
    })
  })

  it('returns tendency result when withTendency is true', async () => {
    const userId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })

    const entity = simulationFactory.withModelRegion('FR').build()
    entity.computedResults.carbone.bilan = 800

    const coreResult: SimulationResult = {
      simulation: entity,
      group: null,
      tendency: 'decrease',
    }
    serviceMock.getLatestSimulationResultService.mockResolvedValue(coreResult)

    const result = await getLatestSimulationResult({ withTendency: true })

    expect(result).not.toBeNull()
    expect(result.tendency).toBe('decrease')
    expect(serviceMock.getLatestSimulationResultService).toHaveBeenCalledWith({
      withTendency: true,
      userId,
    })
  })

  it('returns group info with type "group" when the latest simulation has a group', async () => {
    const userId = randomUUID()
    const groupId = randomUUID()
    vi.mocked(getUserSession).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      isAuth: true,
    })

    const entity = simulationFactory.withModelRegion('FR').build()
    const coreResult: SimulationResult = {
      simulation: entity,
      group: { type: 'group', value: { id: groupId, name: 'My Group' } },
      tendency: null,
    }
    serviceMock.getLatestSimulationResultService.mockResolvedValue(coreResult)

    const result = await getLatestSimulationResult({ withTendency: false })

    expect(result).not.toBeNull()
    expect(result.group).toEqual({
      type: 'group',
      value: { id: groupId, name: 'My Group' },
    })
  })
})
