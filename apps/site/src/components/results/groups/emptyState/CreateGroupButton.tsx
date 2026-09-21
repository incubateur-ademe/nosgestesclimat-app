'use client'

import Trans from '@/components/translation/trans/TransClient'
import { linkToGroupCreation } from '@/constants/group'
import ButtonLink from '@/design-system/buttons/ButtonLink'

export default function CreateGroupButton() {
  return (
    <ButtonLink data-testid="create-group-button" href={linkToGroupCreation}>
      <Trans i18nKey="mon-espace.groups.empty.button">Créer un groupe</Trans>
    </ButtonLink>
  )
}
