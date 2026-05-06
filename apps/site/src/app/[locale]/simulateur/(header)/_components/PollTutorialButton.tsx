import Trans from '@/components/translation/trans/TransServer'
import Button from '@/design-system/buttons/Button'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Emoji from '@/design-system/utils/Emoji'
import type { PublicOrganisationPoll } from '@/types/organisations'

interface Props {
  poll: PublicOrganisationPoll
  locale: string
  createSimulation: () => void
}

export default function PollTutorialButton({
  poll,
  locale,

  createSimulation,
}: Props) {
  if (poll.simulations.hasParticipated && poll.progression === 1) {
    return (
      <div>
        <p
          className="mb-4 text-sm text-gray-500"
          data-testid="youth-tutorial-already-participated">
          {poll.mode === 'scolaire' ? (
            <Trans locale={locale}>Tu as déja participé à ce test.</Trans>
          ) : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          poll.mode === 'standard' ? (
            <Trans locale={locale}>
              Vous avez déjà participé à ce sondage.
            </Trans>
          ) : (
            (poll.mode satisfies never)
          )}
        </p>

        <ButtonLink
          href={`/organisations/${poll.organisation.slug}/campagnes/${poll.slug}`}>
          <Trans locale={locale}>Voir les résultats</Trans>
        </ButtonLink>
      </div>
    )
  }

  if (poll.mode === 'scolaire') {
    return (
      <>
        <Button
          size="lg"
          aria-describedby="subtitle-cta"
          data-testid="youth-tutorial-start-button"
          onClick={createSimulation}>
          <Trans locale={locale} i18nKey="youthTutorial.cta.label">
            Allez, c'est parti
          </Trans>
        </Button>

        <p id="subtitle-cta" className="mt-2 text-sm text-slate-700">
          <Trans locale={locale} i18nKey="youthTutorial.cta.helper">
            Ça prend seulement quelques minutes
          </Trans>{' '}
          <Emoji>⏱️</Emoji>
        </p>
      </>
    )
  }

  return (
    <Button
      onClick={createSimulation}
      data-testid="skip-tutorial-button"
      className="min-w-42!">
      <Trans locale={locale}>C'est parti !</Trans>{' '}
      <span aria-hidden="true">→</span>
    </Button>
  )
}
