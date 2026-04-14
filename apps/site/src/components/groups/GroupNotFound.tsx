'use client'

import { MON_ESPACE_GROUPS_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title from '@/design-system/layout/Title'
import Trans from '../translation/trans/TransClient'

export default function GroupNotFound() {
  return (
    <div className="flex flex-col items-start">
      <Title
        title={<Trans>Oups ! Nous n'avons pas trouvé votre groupe</Trans>}
      />

      <p className="mt-2 mb-8">
        <Trans>Ce groupe n'existe pas ou a été supprimé.</Trans>
      </p>

      <ButtonLink href={MON_ESPACE_GROUPS_PATH}>
        <Trans>Retour à la liste des groupes</Trans>
      </ButtonLink>
    </div>
  )
}
