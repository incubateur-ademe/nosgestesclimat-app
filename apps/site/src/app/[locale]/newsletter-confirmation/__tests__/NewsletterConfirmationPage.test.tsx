import { renderWithWrapper } from '@/helpers/tests/wrapper'
import i18nConfig, { type Locale } from '@/i18nConfig'
import { act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NewsletterErrorMessage from '../_components/NewsletterErrorMessage'
import NewsletterInvalidMessage from '../_components/NewsletterInvalidMessage'
import NewsletterSuccessMessage from '../_components/NewsletterSuccessMessage'
import NewsletterConfirmationPage from '../page'

vi.mock('../_components/NewsletterSuccessMessage', () => ({
  __esModule: true,
  default: vi.fn(() => null),
}))

vi.mock('../_components/NewsletterErrorMessage', () => ({
  __esModule: true,
  default: vi.fn(() => null),
}))

vi.mock('../_components/NewsletterInvalidMessage', () => ({
  __esModule: true,
  default: vi.fn(() => null),
}))

// Mock HeaderServer
vi.mock('@/components/layout/HeaderServer', () => ({
  __esModule: true,
  default: vi.fn(() => null),
}))

describe('NewsletterConfirmationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render success message when success=true', async () => {
    const props = {
      params: Promise.resolve({ locale: i18nConfig.defaultLocale as Locale }),
      searchParams: Promise.resolve({ success: 'true' as const }),
    }

    // When
    await act(async () => {
      renderWithWrapper(await NewsletterConfirmationPage(props))
    })

    // Then
    expect(NewsletterSuccessMessage).toHaveBeenCalledWith(
      { locale: i18nConfig.defaultLocale },
      undefined
    )
    expect(NewsletterErrorMessage).not.toHaveBeenCalled()
    expect(NewsletterInvalidMessage).not.toHaveBeenCalled()
  })

  it('should render the invalid message when success=false and status=404', async () => {
    // Given
    const props = {
      params: Promise.resolve({ locale: i18nConfig.defaultLocale as Locale }),
      searchParams: Promise.resolve({
        success: 'false' as const,
        status: '404' as const,
      }),
    }

    // When
    await act(async () => {
      renderWithWrapper(await NewsletterConfirmationPage(props))
    })

    // Then
    expect(NewsletterSuccessMessage).not.toHaveBeenCalled()
    expect(NewsletterErrorMessage).not.toHaveBeenCalled()
    expect(NewsletterInvalidMessage).toHaveBeenCalledWith(
      { locale: i18nConfig.defaultLocale },
      undefined
    )
  })

  it('should render the error message when success=false and status=500', async () => {
    // Given
    const props = {
      params: Promise.resolve({ locale: i18nConfig.defaultLocale as Locale }),
      searchParams: Promise.resolve({
        success: 'false' as const,
        status: '500' as const,
      }),
    }

    // When
    await act(async () => {
      renderWithWrapper(await NewsletterConfirmationPage(props))
    })

    // Then
    expect(NewsletterSuccessMessage).not.toHaveBeenCalled()
    expect(NewsletterErrorMessage).toHaveBeenCalledWith(
      { locale: i18nConfig.defaultLocale },
      undefined
    )
    expect(NewsletterInvalidMessage).not.toHaveBeenCalled()
  })

  it('should redirect to the 404 page if wrong success param is passed', async () => {
    // Given
    const props = {
      params: Promise.resolve({ locale: i18nConfig.defaultLocale as Locale }),
      searchParams: Promise.resolve({ success: 'toto' as 'true' }),
    }

    // When & Then
    await expect(NewsletterConfirmationPage(props)).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
  })

  it('should redirect to the 404 page if wrong status param is passed', async () => {
    // Given
    const props = {
      params: Promise.resolve({ locale: i18nConfig.defaultLocale as Locale }),
      searchParams: Promise.resolve({
        success: 'false' as const,
        status: '505' as '500',
      }),
    }

    // When & Then
    await expect(NewsletterConfirmationPage(props)).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
  })
})
