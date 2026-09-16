'use client'

import { useFeatureFlag } from '@/hooks/useFeatureFlag'

interface ActionsPageHeaderSwitchProps {
  /** Rendered for the control group, and until the flag resolves client-side */
  control: React.ReactNode
  /**
   * Page title, kept as a sr-only `h1` for the `test-fond-blanc` and
   * `test-fond-bleu` variants so the page still has one even though the
   * visible header is hidden for them.
   */
  title: React.ReactNode
}

/**
 * Hides the page title/description for the `test-fond-blanc` and
 * `test-fond-bleu` variants of the `abc-test-layout-catalogue` A/B test.
 *
 * The flag is only readable in the browser, so the header briefly flashes
 * for variant users until it resolves — same trade-off as
 * `HighestImpactActionsSectionSwitch`.
 */
export default function ActionsPageHeaderSwitch({
  control,
  title,
}: ActionsPageHeaderSwitchProps) {
  const variant = useFeatureFlag('abc-test-layout-catalogue')

  switch (variant) {
    case 'test-fond-blanc':
    case 'test-fond-bleu':
      return <h1 className="sr-only">{title}</h1>
    case 'control':
    case undefined:
      return control
    default:
      variant satisfies never
      return control
  }
}
