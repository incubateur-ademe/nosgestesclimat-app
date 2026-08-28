import type { UserSimulationProgress } from '@nosgestesclimat/core/features/simulations/types/simulation-progress'
import { v4 as randomUUID } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUserSession } from '@/services/auth/get-user-session'
import { getUserSimulationProgress } from '../get-user-simulation-progress'

const serviceMock = vi.hoisted(() => ({
  getUserSimulationProgress: vi.fn(),
}))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: vi.fn(),
}))

vi.mock(
  '@nosgestesclimat/core/features/simulations/services/get-user-simulation-progress.service',
  () => ({
    getUserSimulationProgress: serviceMock.getUserSimulationProgress,
  })
)

describe('getUserSimulationProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('given an unauthenticated user (no session)', () => {
    it('should return undefined for both simulations without calling the service', async () => {
      vi.mocked(getUserSession).mockResolvedValue(null)

      const result = await getUserSimulationProgress()

      expect(result).toEqual({
        currentSimulation: undefined,
        completedSimulation: undefined,
      })
      expect(serviceMock.getUserSimulationProgress).not.toHaveBeenCalled()
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
      const progress: UserSimulationProgress = {
        currentSimulation: {
          id: 'sim-1',
          progression: 0.5,
          model: 'FR-fr-1.2.3',
        },
      }
      serviceMock.getUserSimulationProgress.mockResolvedValue(progress)

      const result = await getUserSimulationProgress()

      expect(serviceMock.getUserSimulationProgress).toHaveBeenCalledTimes(1)
      expect(serviceMock.getUserSimulationProgress).toHaveBeenCalledWith({
        userId,
      })
      expect(result).toBe(progress)
    })
  })

  describe('given an anonymous user (session present, isAuth false)', () => {
    it('should still delegate to the service with the anonymous user id', async () => {
      const userId = randomUUID()
      vi.mocked(getUserSession).mockResolvedValue({ id: userId, isAuth: false })
      serviceMock.getUserSimulationProgress.mockResolvedValue({})

      await getUserSimulationProgress()

      expect(serviceMock.getUserSimulationProgress).toHaveBeenCalledWith({
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
      serviceMock.getUserSimulationProgress.mockRejectedValue(error)

      await expect(getUserSimulationProgress()).rejects.toBe(error)
    })
  })
})
