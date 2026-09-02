import type { UserSimulationJourney } from '@nosgestesclimat/core/features/simulations/types/simulation-progress'
import { v4 as randomUUID } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUserSession } from '@/services/auth/get-user-session'
import { getUserSimulationJourney } from '../get-user-simulation-journey'

const serviceMock = vi.hoisted(() => ({
  getUserSimulationJourney: vi.fn(),
}))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/simulations/services/get-user-simulation-journey.service',
  () => ({
    getUserSimulationJourney: serviceMock.getUserSimulationJourney,
  })
)

describe('getUserSimulationJourney', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('given an unauthenticated user (no session)', () => {
    it('should return undefined for both simulations without calling the service', async () => {
      vi.mocked(getUserSession).mockResolvedValue(null)

      const result = await getUserSimulationJourney()

      expect(result).toEqual({
        currentSimulation: undefined,
        completedSimulation: undefined,
      })
      expect(serviceMock.getUserSimulationJourney).not.toHaveBeenCalled()
    })
  })

  describe('given an authenticated user', () => {
    it('should delegate to the service with the authenticated user id only', async () => {
      const userId = randomUUID()
      vi.mocked(getUserSession).mockResolvedValue({
        id: userId,
        email: 'alice@example.com',
        isAuth: true,
      })
      const progress: UserSimulationJourney = {
        currentSimulation: {
          id: 'sim-1',
          progression: 0.5,
          model: 'FR-fr-1.2.3',
        },
      }
      serviceMock.getUserSimulationJourney.mockResolvedValue(progress)

      const result = await getUserSimulationJourney()

      expect(serviceMock.getUserSimulationJourney).toHaveBeenCalledTimes(1)
      expect(serviceMock.getUserSimulationJourney).toHaveBeenCalledWith({
        userId,
      })
      expect(result).toBe(progress)
    })
  })

  describe('given an anonymous user (session present, isAuth false)', () => {
    it('should still delegate to the service with the anonymous user id', async () => {
      const userId = randomUUID()
      vi.mocked(getUserSession).mockResolvedValue({ id: userId, isAuth: false })
      serviceMock.getUserSimulationJourney.mockResolvedValue({})

      await getUserSimulationJourney()

      expect(serviceMock.getUserSimulationJourney).toHaveBeenCalledWith({
        userId,
      })
    })
  })

  describe('when the service throws', () => {
    it('should propagate the rejection to the caller', async () => {
      const userId = randomUUID()
      vi.mocked(getUserSession).mockResolvedValue({
        id: userId,
        email: 'alice@example.com',
        isAuth: true,
      })
      const error = new Error('boom')
      serviceMock.getUserSimulationJourney.mockRejectedValue(error)

      await expect(getUserSimulationJourney()).rejects.toBe(error)
    })
  })
})
