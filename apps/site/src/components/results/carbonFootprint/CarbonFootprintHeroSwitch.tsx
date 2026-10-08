'use client'

import { useFeatureFlag } from '@/hooks/useFeatureFlag'

interface CarbonFootprintHeroSwitchProps {
  /** Rendered for the control group, and until the flag resolves client-side */
  control: React.ReactNode
  /** Rendered for the `test-new-footprint-display` variant */
  test: React.ReactNode
}

/**
 * Picks the top section of the carbon results page for the
 * `ab-test-global-footprint-display` A/B test.
 *
 * Both sections are server-rendered and handed over as props so that neither
 * has to become a client component. The flag is only readable in the browser,
 * so the control section is rendered until it resolves — variant users briefly
 * see the control one.
 */
export default function CarbonFootprintHeroSwitch({
  control,
  test,
}: CarbonFootprintHeroSwitchProps) {
  const variant = useFeatureFlag('ab-test-global-footprint-display')

  switch (variant) {
    case 'test-new-footprint-display':
      return test
    case 'control':
    case undefined:
      return control
    default:
      variant satisfies never
      return control
  }
}
