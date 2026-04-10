'use client'

import Trans from '@/components/translation/trans/TransClient'
import { linkToGroupCreation } from '@/constants/group'
import { classementCreateGroup } from '@/constants/tracking/pages/classements'
import ButtonLink from '@/design-system/buttons/ButtonLink'

export default function CreateFirstGroupSection() {
  return (
    <section className="mt-4">
      <p className="mb-6">
        <Trans i18nKey="results.groups.createFirstGroup">
          <strong className="text-secondary-700">
            Créez votre premier groupe
          </strong>{' '}
          et invitez vos proches pour comparer vos résultats. Cela prend{' '}
          <strong className="text-secondary-700">1 minute</strong> !
        </Trans>
      </p>
      <ButtonLink
        href={linkToGroupCreation}
        trackingEvent={classementCreateGroup}
        data-testid="button-create-first-group">
        <Trans>Commencer</Trans>
      </ButtonLink>
    </section>
  )
}
