'use client'

import Trans from '@/components/translation/trans/TransClient'
import { createOrganisationLink } from '@/constants/tracking/pages/mainLanding'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'

export default function CreateOrganisationLink() {
  return (
    <ButtonLink
      color="secondary"
      href="/organisations"
      onClick={() => trackMatomoEvent__deprecated(createOrganisationLink)}>
      <Trans>Créer une campagne</Trans>
    </ButtonLink>
  )
}
