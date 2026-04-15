import CloseIcon from '@/components/icons/Close'
import Button from '@/design-system/buttons/Button'
import type { TFunction } from 'i18next'

interface Props {
  t: TFunction
}

export default function CloseButton({ t }: Props) {
  return (
    <Button
      color="secondary"
      aria-label={t(
        'organisations.createPoll.type.closeButton',
        "Abandonner le processus de création de test collectif et revenir à la page d'accueil de votre organisation"
      )}
      className="h-10 w-10 rounded-full p-0!">
      <CloseIcon className="fill-primary-800 max-h-6 min-w-6" />
    </Button>
  )
}
