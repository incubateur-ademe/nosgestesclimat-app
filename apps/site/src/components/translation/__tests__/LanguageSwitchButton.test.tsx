import LanguageSwitchButton from '@/components/translation/LanguageSwitchButton'
import { renderWithWrapper } from '@/helpers/tests/wrapper'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCurrentLocale } from 'next-i18n-router/client'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// next/link needs a router context in tests; render plain anchors instead,
// preventing jsdom from attempting a real navigation on click
vi.mock('next/link', () => ({
  default: ({
    children,
    onClick,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children?: ReactNode
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  }) => (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- test helper replacing next/link
    <a
      {...props}
      onClick={(event) => {
        event.preventDefault()
        onClick?.(event)
      }}>
      {children}
    </a>
  ),
}))

// The language paths are normally read from the DOM hreflang tags
vi.mock('@/hooks/useAlternateLanguagePaths', () => ({
  useAlternateLanguagePaths: vi.fn(() => ({ fr: '/fr', en: '/en' })),
}))

vi.mock('@/constants/tracking/posthogTrackers', () => ({
  captureClickLanguage: ({ locale }: { locale: string }) => ({ locale }),
}))

vi.mock('@/utils/analytics/trackEvent', () => ({
  trackMatomoEvent__deprecated: vi.fn(),
  trackPosthogEvent: vi.fn(),
}))

describe('LanguageSwitchButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a trigger showing the current language (defaults to FR)', () => {
    renderWithWrapper(<LanguageSwitchButton />)

    const trigger = screen.getByTestId('language-switch-button')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('FR')
    expect(trigger).not.toHaveTextContent('EN')
  })

  it('allows to change language from the default to EN and change back to FR', async () => {
    const user = userEvent.setup()

    // Clicking a language link navigates to the other locale's URL, then the
    // i18n router provides the new locale. Navigation is prevented in tests
    // (mocked next/link, static useCurrentLocale), so we simulate landing on
    // the new page: update the mocked locale and remount the component.
    let locale: 'fr' | 'en' = 'fr'
    vi.mocked(useCurrentLocale).mockImplementation(() => locale)

    let view = renderWithWrapper(<LanguageSwitchButton />)
    const trigger = () => screen.getByTestId('language-switch-button')

    expect(trigger()).toBeInTheDocument()
    expect(trigger()).toHaveTextContent('FR')

    // Switch to EN
    await user.click(trigger())
    await user.click(screen.getByTestId('language-switch-button-en'))

    locale = 'en'
    view.unmount()
    view = renderWithWrapper(<LanguageSwitchButton />)

    expect(trigger()).toHaveTextContent('EN')

    // Switch back to FR (the EN page only offers the FR link)
    await user.click(trigger())
    await user.click(screen.getByTestId('language-switch-button-fr'))

    locale = 'fr'
    view.unmount()
    view = renderWithWrapper(<LanguageSwitchButton />)

    expect(trigger()).toHaveTextContent('FR')
  })

  it('shows the English language as current when the locale is en', () => {
    vi.mocked(useCurrentLocale).mockReturnValueOnce('en')

    renderWithWrapper(<LanguageSwitchButton />)

    const trigger = screen.getByTestId('language-switch-button')
    expect(trigger).toHaveTextContent('EN')
  })
})
