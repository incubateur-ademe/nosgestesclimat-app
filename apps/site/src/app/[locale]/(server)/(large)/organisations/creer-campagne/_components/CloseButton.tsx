'use client'

import CloseIcon from '@/components/icons/Close'
import { ORGANISATION_HOME_PAGE } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { clearDraft } from '../_services/pollDraftClient'

export default function CloseButton() {
  const { t } = useClientTranslation()

  return (
    <ButtonLink
      href={ORGANISATION_HOME_PAGE}
      onClick={() => clearDraft()}
      color="secondary"
      aria-label={t(
        'organisations.createPoll.type.closeButton.aria',
        'Abandonner le processus de création de test collectif'
      )}
      title={t(
        'organisations.createPoll.type.closeButton.title',
        'Abandonner la création du test collectif'
      )}
      className="h-10 w-10 rounded-full p-0!">
      <CloseIcon className="fill-primary-800 max-h-6 min-w-6" />
    </ButtonLink>
  )
}
