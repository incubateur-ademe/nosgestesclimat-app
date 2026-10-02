'use client'

import { useFeatureFlag } from '@/hooks/useFeatureFlag'

interface ActionCardSwitchProps {
  /** Rendered for the control group, and until the flag resolves client-side */
  control: React.ReactNode
  /** Rendered for the `cta` variant */
  cta: React.ReactNode
  /** Rendered for the `teaser-cta` variant */
  teaserCta: React.ReactNode
}

/**
 * Picks the action card layout for the `abc-test-action-card` A/B test.
 *
 * The three cards are server-rendered and handed over as props so that none of
 * the card variants has to become a client component. The flag is only readable
 * in the browser, so the control card is rendered until it resolves — variant
 * users briefly see the control one.
 */
export default function ActionCardSwitch({
  control,
  cta,
  teaserCta,
}: ActionCardSwitchProps) {
  const variant = useFeatureFlag('abc-test-action-card')

  switch (variant) {
    case 'cta':
      return cta
    case 'teaser-cta':
      return teaserCta
    case 'control':
    case undefined:
      return control
    default:
      variant satisfies never
      return control
  }
}
