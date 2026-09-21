'use client'

import Trans from '@/components/translation/trans/TransClient'
import { captureClickHeaderMonEspace } from '@/constants/tracking/trackers'
import { CONNEXION_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { trackEvent } from '@/utils/analytics/trackEvent'

export default function MySpaceButton() {
  return (
    <ButtonLink
      color="secondary"
      href={CONNEXION_PATH}
      data-testid="my-space-connexion-link"
      className="ph-no-capture"
      onClick={() => {
        trackEvent(
          captureClickHeaderMonEspace({
            status: 'unauthenticated',
          })
        )
      }}>
      <Trans i18nKey="header.monEspace.title">Mon espace</Trans>
    </ButtonLink>
  )
}
