'use client'

import Baseline from '@/components/organisations/Baseline'
import Trans from '@/components/translation/trans/TransClient'
import { captureClickDashboardGroupPageCreateOrganisation } from '@/constants/tracking/posthogTrackers'
import { clickDashboardGroupPageCreateOrganisation } from '@/constants/tracking/user-account'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title from '@/design-system/layout/Title'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'

export default function CreateOrganisation() {
  return (
    <div className="mt-12 mb-16">
      <Title
        title={
          <Trans i18nKey="mon-espace.groups.organisation.create.title">
            Mobiliser mon organisation
          </Trans>
        }
        tag="h2"
      />

      <div className="mb-4 max-w-3xl" data-testid="create-organisation">
        <Baseline />
      </div>

      <ButtonLink
        className="font-bold"
        href="/organisations/connexion"
        onClick={() => {
          trackMatomoEvent__deprecated(
            clickDashboardGroupPageCreateOrganisation
          )
          trackPosthogEvent(captureClickDashboardGroupPageCreateOrganisation)
        }}>
        <Trans i18nKey="mon-espace.groups.organisation.create.button">
          Créer mon organisation
        </Trans>
      </ButtonLink>
    </div>
  )
}
