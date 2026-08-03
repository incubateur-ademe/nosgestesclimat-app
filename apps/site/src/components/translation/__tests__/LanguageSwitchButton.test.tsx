import LanguageSwitchButton from '@/components/translation/LanguageSwitchButton'
import { updateLangCookie } from '@/helpers/language/updateLangCookie'
import { renderWithWrapper } from '@/helpers/tests/wrapper'
import { useAlternateLanguagePaths } from '@/hooks/useAlternateLanguagePaths'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
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
  captureFooterClickLanguage: ({ locale }: { locale: string }) => ({ locale }),
}))

vi.mock('@/helpers/language/updateLangCookie', () => ({
  updateLangCookie: vi.fn(),
}))

vi.mock('@/utils/analytics/trackEvent', () => ({
  trackMatomoEvent__deprecated: vi.fn(),
  trackPosthogEvent: vi.fn(),
}))

describe('LanguageSwitchButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a trigger showing the current language', () => {
    renderWithWrapper(<LanguageSwitchButton />)

    const trigger = screen.getByTestId('language-switch-button')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('FR')
    expect(trigger).not.toHaveTextContent('EN')
  })

  it('opens a dropdown listing both languages when clicked', async () => {
    const user = userEvent.setup()
    renderWithWrapper(<LanguageSwitchButton />)

    await user.click(screen.getByTestId('language-switch-button'))

    expect(screen.getByTestId('language-switch-button-fr')).toBeInTheDocument()
    expect(screen.getByTestId('language-switch-button-en')).toBeInTheDocument()
  })

  it('marks the current language as active in the dropdown', async () => {
    const user = userEvent.setup()
    renderWithWrapper(<LanguageSwitchButton />)

    await user.click(screen.getByTestId('language-switch-button'))

    expect(screen.getByTestId('language-switch-button-fr')).toHaveAttribute(
      'aria-current',
      'true'
    )
    expect(screen.getByTestId('language-switch-button-en')).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('updates the cookie, tracks the click and closes the menu on selection', async () => {
    const user = userEvent.setup()
    renderWithWrapper(<LanguageSwitchButton />)

    await user.click(screen.getByTestId('language-switch-button'))
    await user.click(screen.getByTestId('language-switch-button-en'))

    expect(updateLangCookie).toHaveBeenCalledWith('en')
    expect(trackMatomoEvent__deprecated).toHaveBeenCalled()
    expect(trackPosthogEvent).toHaveBeenCalledWith({ locale: 'en' })

    expect(
      screen.queryByTestId('language-switch-button-en')
    ).not.toBeInTheDocument()
  })

  it('shows the English language as current when the locale is en', () => {
    vi.mocked(useCurrentLocale).mockReturnValueOnce('en')

    renderWithWrapper(<LanguageSwitchButton />)

    const trigger = screen.getByTestId('language-switch-button')
    expect(trigger).toHaveTextContent('EN')
  })

  it('adds space to the right of the component', () => {
    renderWithWrapper(<LanguageSwitchButton />)

    const trigger = screen.getByTestId('language-switch-button')
    const root = trigger.parentElement?.parentElement
    expect(root).toHaveClass('mr-2')
  })

  it('skips languages without an alternate path', async () => {
    vi.mocked(useAlternateLanguagePaths).mockReturnValueOnce({ fr: '/fr' })

    const user = userEvent.setup()
    renderWithWrapper(<LanguageSwitchButton />)

    await user.click(screen.getByTestId('language-switch-button'))

    expect(screen.getByTestId('language-switch-button-fr')).toBeInTheDocument()
    expect(
      screen.queryByTestId('language-switch-button-en')
    ).not.toBeInTheDocument()
  })
})
