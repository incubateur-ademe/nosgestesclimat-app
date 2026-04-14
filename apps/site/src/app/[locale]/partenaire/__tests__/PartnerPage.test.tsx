import { mswServer } from '@/__tests__/server'
import { PARTNER_JAGIS, PARTNER_KEY } from '@/constants/partners'
import { INTEGRATION_URL } from '@/constants/urls/main'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import { renderWithWrapper } from '@/helpers/tests/wrapper'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import { faker } from '@faker-js/faker'
import '@testing-library/jest-dom'
import { act, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { notFound } from 'next/navigation'
import { vi } from 'vitest'
import PartnerPage from '../page'

const mockNotFound = vi.mocked(notFound)

vi.mock('@/components/layout/HeaderServer', () => ({
  __esModule: true,
  default: vi.fn(() => null),
}))

describe('PartnerPage', () => {
  const defaultSearchParams = Promise.resolve({
    [PARTNER_KEY]: PARTNER_JAGIS,
  })
  const defaultParams = Promise.resolve({ locale: 'fr' as const })

  const defaultSimulation = generateSimulation({
    id: faker.string.uuid(),
    progression: 1,
  })

  beforeEach(() => {
    vi.clearAllMocks()
    safeLocalStorage.clear()
  })

  describe('when user has a simulation', () => {
    it('should display a message indicating the upcoming redirection', async () => {
      // Given
      mswServer.use(
        http.get(`${INTEGRATION_URL}/${PARTNER_JAGIS}`, () => {
          return HttpResponse.json({ name: 'Test Partner' })
        })
      )

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
      mswServer.use(
        http.get(`${INTEGRATION_URL}/${PARTNER_JAGIS}`, () => {
          return HttpResponse.error()
        })
      )

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
      mswServer.use(
        http.get(`${INTEGRATION_URL}/${PARTNER_JAGIS}`, () => {
          return HttpResponse.json({ name: 'Test Partner' })
        })
      )

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
