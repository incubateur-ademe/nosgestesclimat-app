'use client'

import Trans from '@/components/translation/trans/TransClient'
import ButtonLink from '@/design-system/buttons/ButtonLink'

export default function CreateGroupLink() {
  return (
    <ButtonLink href="/amis/creer/connexion">
      <Trans>Créer un groupe</Trans>
    </ButtonLink>
  )
}
