import CloseIcon from '@/components/icons/Close'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import type { TFunction } from 'i18next'

interface Props {
  organisationSlug: string
  t: TFunction
}

export default function CloseButton({ t, organisationSlug }: Props) {
  return (
    <ButtonLink
      href={`/organisations/${organisationSlug}`}
      color="secondary"
      aria-label={t(
        'organisations.createPoll.type.closeButton.aria',
        "Abandonner le processus de création de test collectif et revenir à la page d'accueil de votre organisation"
      )}
      title={t(
        'organisations.createPoll.type.closeButton.title',
        "Abandonner la création du test collectif et revenir à la page d'accueil de votre organisation"
      )}
      className="h-10 w-10 rounded-full p-0!">
      <CloseIcon className="fill-primary-800 max-h-6 min-w-6" />
    </ButtonLink>
  )
}
