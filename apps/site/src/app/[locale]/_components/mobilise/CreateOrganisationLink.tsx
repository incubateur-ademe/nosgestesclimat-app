'use client'

import Trans from '@/components/translation/trans/TransClient'
import { createOrganisationLink } from '@/constants/tracking/pages/mainLanding'
import { COLLECTIVE_TEST_INFORMATIONS_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'

export default function CreateOrganisationLink() {
  return (
    <ButtonLink
      color="secondary"
      href={COLLECTIVE_TEST_INFORMATIONS_PATH}
      onClick={() => trackMatomoEvent__deprecated(createOrganisationLink)}>
      <Trans>Créer un test collectif</Trans>
    </ButtonLink>
  )
}
