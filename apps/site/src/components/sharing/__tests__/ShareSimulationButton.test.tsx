import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/hooks/useClientTranslation', () => ({
  useClientTranslation: () => ({
    t: (value: string) => value,
  }),
}))

vi.mock('@/utils/analytics/trackEvent', () => ({
  trackMatomoEvent__deprecated: vi.fn(),
  trackPosthogEvent: vi.fn(),
}))

vi.mock('is-mobile', () => ({
  default: () => false,
}))

import ShareSimulationButton from '../ShareSimulationButton'

describe('ShareSimulationButton', () => {
  it('encodes the email body so query parameters stay in the shared URL', async () => {
    const sharedUrl =
      'https://nosgestesclimat.fr/simulateur?utm_medium=sharelink&utm_source=NGC'

    render(<ShareSimulationButton url={sharedUrl} />)

    await userEvent.click(screen.getByTestId('share-button'))

    expect(screen.getByTestId('share-button-link-4')).toHaveAttribute(
      'href',
      `mailto:?subject=Voici mes empreintes carbone et eau ; tu connais les tiennes ?&body=${encodeURIComponent(sharedUrl)}`
    )
  })
})
