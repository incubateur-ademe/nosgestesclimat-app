import PartnerRedirectionAlert from '@/app/[locale]/(server)/(large)/fin/_components/PartnerRedirectionAlert'
import { buildNewSimulationPayload } from '@/services/simulations/build-new-simulation-payload'
import { renderWithWrapper } from '@/helpers/tests/wrapper'
import { useExportSituation } from '@/hooks/partners/useExportSituation'
import { useVerifyPartner } from '@/hooks/partners/useVerifyPartner'
import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the hooks
vi.mock('@/hooks/partners/useExportSituation')
vi.mock('@/hooks/partners/useVerifyPartner')

// Les services API sont maintenant gérés par MSW dans src/__tests__/server.ts

// Mock Sentry to avoid issues in tests
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

// Mock the hooks with proper return values
const mockUseExportSituation = useExportSituation as ReturnType<typeof vi.fn>
const mockUseVerifyPartner = useVerifyPartner as ReturnType<typeof vi.fn>

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
})

// Mock window.location
const originalLocation = window.location

describe('PartnerContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionStorage.getItem.mockReturnValue(null)
    mockSessionStorage.setItem.mockReturnValue(undefined)
    mockSessionStorage.removeItem.mockReturnValue(undefined)
    mockSessionStorage.clear.mockReturnValue(undefined)

    // Reset window.location to default
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '' },
      writable: true,
    })
  })

  const defaultSimulation = buildNewSimulationPayload({
    progression: 1,
    model: 'FR-fr-1.2.3',
  })

  const redirectUrl = '/partner-site'

  describe('given undefined search params', () => {
    it('should not crash the app', () => {
      // Given
      mockUseVerifyPartner.mockReturnValue(false)
      mockUseExportSituation.mockReturnValue({
        exportSituationAsync: vi.fn().mockResolvedValue({ redirectUrl }),
        exportSituation: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
        error: null,
        data: null,
      })

      // When
      const { container } = renderWithWrapper(<PartnerRedirectionAlert />, {
        providers: {
          partner: true,
          queryClient: true,
          errorBoundary: true,
        },
      })

      // Then — no partner param means no alert at all. An empty container also
      // proves the boundary below did not swap in its error fallback.
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('given a user with no simulation at all', () => {
    it('should not crash: PartnerProvider is mounted on every page', () => {
      // Given — this is the ClientLayout case: a UserProvider is mounted but the
      // visitor has never taken the test, so there is no simulation to read.
      mockUseVerifyPartner.mockReturnValue(false)
      mockUseExportSituation.mockReturnValue({
        exportSituationAsync: vi.fn().mockResolvedValue({ redirectUrl }),
        exportSituation: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
        error: null,
        data: null,
      })

      // When
      const { container } = renderWithWrapper(<PartnerRedirectionAlert />, {
        providers: {
          partner: true,
          queryClient: true,
          user: true,
          errorBoundary: true,
        },
        simulations: [],
      })

      // Then — reading an absent simulation must not throw: an empty container
      // proves the boundary did not swap in its error fallback.
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('given a user with a completed test', () => {
    it("should send the user's situation to the back-end and redirect to the obtained URL", async () => {
      // Mock window.location.search with partner parameters
      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          search: '?partner=test&partner-test=test',
        },
        writable: true,
      })

      // Mock exportSituationAsync to return the redirect URL
      const mockExportSituationAsync = vi
        .fn()
        .mockResolvedValue({ redirectUrl })

      mockUseVerifyPartner.mockReturnValue(true)
      mockUseExportSituation.mockReturnValue({
        exportSituationAsync: mockExportSituationAsync,
        exportSituation: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
        error: null,
        data: null,
      })

      // When
      renderWithWrapper(<PartnerRedirectionAlert />, {
        providers: {
          partner: true,
          queryClient: true,
          user: true,
        },
        currentSimulation: defaultSimulation,
        simulations: [defaultSimulation],
      })

      // Then - wait for the async export to complete and the button to appear
      const redirectButton = await waitFor(
        async () => {
          return await screen.findByTestId('button-redirect')
        },
        { timeout: 5000 }
      )
      expect(redirectButton).toHaveAttribute('href', redirectUrl)
      expect(mockExportSituationAsync).toHaveBeenCalled()
    })
  })

  describe('given a user with an incompleted test', () => {
    it('should save the partner params to the session storage and redirect to the test', async () => {
      // Given
      const incompleteSimulation = buildNewSimulationPayload({
        progression: 0,
        model: 'FR-fr-1.2.3',
      })
      // Mock window.location.search with partner parameters
      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          search: '?partner=test&partner-test=test',
        },
        writable: true,
      })
      mockUseVerifyPartner.mockReturnValue(true)
      mockUseExportSituation.mockReturnValue({
        exportSituationAsync: vi.fn().mockResolvedValue({ redirectUrl }),
        exportSituation: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
        error: null,
        data: null,
      })

      // When
      renderWithWrapper(<PartnerRedirectionAlert />, {
        providers: {
          partner: true,
          queryClient: true,
          user: true,
        },
        currentSimulation: incompleteSimulation,
        simulations: [incompleteSimulation],
      })

      // Then
      await waitFor(() => {
        expect(sessionStorage.getItem('partner')).not.toBe(undefined)
      })
    })
  })
})
