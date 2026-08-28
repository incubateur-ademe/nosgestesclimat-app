import { PARTNER_JAGIS, PARTNER_KEY } from '@/constants/partners'
import { renderWithWrapper } from '@/helpers/tests/wrapper'
import { buildNewSimulationPayload } from '@/services/simulations/build-new-simulation-payload'
import type { UserSimulationProgress } from '@nosgestesclimat/core/features/simulations/types/simulation-progress'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { faker } from '@faker-js/faker'
import '@testing-library/jest-dom'
import { act, screen, waitFor } from '@testing-library/react'
import { notFound } from 'next/navigation'
import { vi } from 'vitest'
import PartnerPage from '../page'

const mockVerifyPartner = vi.fn<(partner: string) => Promise<unknown>>()
const mockGetUserSimulationProgress =
  vi.fn<() => Promise<UserSimulationProgress>>()
const mockNotFound = vi.mocked(notFound)

vi.mock('@/services/partners/verifyPartner', () => ({
  verifyPartner: (partner: string) => mockVerifyPartner(partner),
}))

// The page resolves the simulation server-side, so it cannot be driven from the
// test wrapper's client-side user context.
vi.mock('@/services/simulations/get-user-simulation-progress', () => ({
  getUserSimulationProgress: () => mockGetUserSimulationProgress(),
}))

vi.mock('@/components/layout/HeaderServer', () => ({
  __esModule: true,
  default: vi.fn(() => null),
}))

describe('PartnerPage', () => {
  const defaultSearchParams = Promise.resolve({
    [PARTNER_KEY]: PARTNER_JAGIS,
  })
  const defaultParams = Promise.resolve({ locale: 'fr' as const })

  const defaultSimulation = buildNewSimulationPayload({
    id: faker.string.uuid(),
    progression: 1,
    model: 'FR-fr-1.2.3',
  })

  const completedProgress = {
    id: faker.string.uuid(),
    progression: 1 as const,
    model: 'FR-fr-1.2.3',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserSimulationProgress.mockResolvedValue({})
    safeLocalStorage.clear()
  })

  describe('when user has a simulation', () => {
    it('should display a message indicating the upcoming redirection', async () => {
      // Given
      mockVerifyPartner.mockResolvedValue({ name: 'Test Partner' })
      mockGetUserSimulationProgress.mockResolvedValue({
        currentSimulation: completedProgress,
        completedSimulation: completedProgress,
      })

      // When
      await act(async () => {
        renderWithWrapper(
          await PartnerPage({
            params: defaultParams,
            searchParams: defaultSearchParams,
          }),
          {
            providers: {
              queryClient: true,
              errorBoundary: true,
              user: true,
              partner: true,
            },
            currentSimulation: defaultSimulation,
            simulations: [defaultSimulation],
          }
        )
      })

      // Then
      await waitFor(() => {
        expect(screen.getByTestId('redirection-message')).toBeInTheDocument()
      })
    })
  })

  describe('when no partner search param is provided', () => {
    it('should redirect to /404', async () => {
      // Given
      const searchParams = Promise.resolve({})

      // When & Then
      await expect(
        PartnerPage({ params: defaultParams, searchParams })
      ).rejects.toThrow('NEXT_NOT_FOUND')
      expect(mockNotFound).toHaveBeenCalled()
    })
  })

  describe('when partner is not verified', () => {
    it('should redirect to /404', async () => {
      // Given
      mockVerifyPartner.mockResolvedValue(undefined)

      // When & Then
      await expect(
        PartnerPage({
          params: defaultParams,
          searchParams: defaultSearchParams,
        })
      ).rejects.toThrow('NEXT_NOT_FOUND')
      expect(mockNotFound).toHaveBeenCalled()
    })
  })

  describe('when user has not completed the test', () => {
    it('should redirect to /simulateur/bilan', async () => {
      // Given
      mockVerifyPartner.mockResolvedValue({ name: 'Test Partner' })
      mockGetUserSimulationProgress.mockResolvedValue({
        currentSimulation: {
          id: faker.string.uuid(),
          progression: 0,
          model: 'FR-fr-1.2.3',
        },
      })

      // When
      await act(async () =>
        renderWithWrapper(
          await PartnerPage({
            params: defaultParams,
            searchParams: defaultSearchParams,
          }),
          {
            providers: {
              queryClient: true,
              errorBoundary: true,
              user: true,
              partner: true,
            },
            currentSimulation: {
              progression: 0,
            },
          }
        )
      )

      // Then
      expect(screen.getByTestId('test-message')).toBeInTheDocument()
    })
  })
})
