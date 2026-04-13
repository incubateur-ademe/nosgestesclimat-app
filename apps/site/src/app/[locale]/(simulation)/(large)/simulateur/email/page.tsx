'use client'

import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import Trans from '@/components/translation/trans/TransClient'
import { END_PAGE_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import InlineLink from '@/design-system/inputs/InlineLink'
import Title from '@/design-system/layout/Title'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useCurrentSimulation } from '@/publicodes-state'

export default function Email() {
  const { t } = useClientTranslation()
  const { polls } = useCurrentSimulation()
  const pollSlug = polls?.[0]?.slug
  const hasContest =
    pollSlug &&
    (process.env.NEXT_PUBLIC_POLL_CONTEST_SLUGS ?? '')
      .split(',')
      .includes(pollSlug)
  return (
    <>
      <Title
        data-testid="tutoriel-title"
        className="text-lg md:text-2xl"
        title={<Trans>Votre adresse electronique</Trans>}
        subtitle={
          <>
            <Trans>
              Pour conserver vos résultats et les retrouver à l’avenir dans{' '}
              <strong>votre espace personnel</strong>
            </Trans>
            {hasContest ? (
              <span>
                <Trans>Votre e-mail sera utilisé pour le tirage au sort.</Trans>{' '}
                <InlineLink
                  target="_blank"
                  href="/politique-de-confidentialite">
                  <Trans>En savoir plus</Trans>
                </InlineLink>
              </span>
            ) : null}

            <span className="text-secondary-700 ml-2 inline-block font-bold italic">
              <Trans>facultatif</Trans>
            </span>
          </>
        }
      />
      <AuthenticateUserForm
        buttonLabel={t('Vérifier mon adresse email')}
        additionnalButton={
          <ButtonLink
            color="secondary"
            href={END_PAGE_PATH}
            data-testid="skip-email-button">
            <Trans>Passer</Trans>
          </ButtonLink>
        }
        redirectPathname={END_PAGE_PATH}
      />
    </>
  )
}
