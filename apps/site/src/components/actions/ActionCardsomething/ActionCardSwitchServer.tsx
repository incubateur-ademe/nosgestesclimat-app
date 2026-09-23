import ActionCard, { type ActionCardProps } from '../ActionCard'
import ActionCardSwitch from './ActionCardSwitch'

/**
 * Server wrapper around the client `ActionCardSwitch` for the
 * `abc-test-action-card` A/B test.
 *
 * Renders the three card variants server-side from a single set of props and
 * hands them to the switcher, so parents don't have to pass the same props
 * three times. The flag is only readable in the browser, so the control card
 * is rendered until it resolves — variant users briefly see the control one.
 */
export default function ActionCardSwitchServer(props: ActionCardProps) {
  return (
    <ActionCardSwitch
      control={<ActionCard {...props} />}
      cta={<ActionCard {...props} withCta />}
      teaserCta={<ActionCard {...props} withCta withDescription />}
    />
  )
}
