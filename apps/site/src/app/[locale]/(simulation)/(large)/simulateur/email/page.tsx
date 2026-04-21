import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import Trans from '@/components/translation/trans/TransServer'
import { END_PAGE_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import InlineLink from '@/design-system/inputs/InlineLink'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getUser } from '@/helpers/server/dal/user'
import { getSimulations } from '@/helpers/server/model/simulations'
import { UserProvider } from '@/publicodes-state'
import { notFound } from 'next/navigation'

export default async function Email({
  params,
}: PageProps<'/[locale]/simulateur/email'>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })
  const user = await getUser()
  const [currentSimulation] = await getSimulations({ user }, { pageSize: 1 })
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!currentSimulation) {
    notFound()
  }
  const pollSlug = currentSimulation.polls?.[0]?.slug
  const hasContest =
    pollSlug &&
    (process.env.NEXT_PUBLIC_POLL_CONTEST_SLUGS ?? '')
      .split(',')
      .includes(pollSlug)

  return (
    <>
      <Title
        className="pt-8"
        data-testid="tutoriel-title"
        title={<Trans locale={locale}>Votre adresse electronique</Trans>}
        subtitle={
          <>
            <Trans locale={locale}>
              Pour conserver vos résultats et les retrouver à l’avenir dans{' '}
              <strong>votre espace personnel</strong>
            </Trans>
            {hasContest ? (
              <span>
                <Trans locale={locale}>
                  Votre e-mail sera utilisé pour le tirage au sort.
                </Trans>{' '}
                <InlineLink
                  target="_blank"
                  href="/politique-de-confidentialite">
                  <Trans locale={locale}>En savoir plus</Trans>
                </InlineLink>
              </span>
            ) : null}

            <span className="text-secondary-700 ml-2 inline-block font-bold italic">
              <Trans locale={locale}>facultatif</Trans>
            </span>
          </>
        }
      />
      <UserProvider serverUserId={user.id}>
        <QueryClientProviderWrapper>
          <AuthenticateUserForm
            buttonLabel={t('Vérifier mon adresse email')}
            additionnalButton={
              <ButtonLink
                color="secondary"
                href={END_PAGE_PATH}
                data-testid="skip-email-button">
                <Trans locale={locale}>Passer</Trans>
              </ButtonLink>
            }
            redirectPathname={END_PAGE_PATH}
          />
        </QueryClientProviderWrapper>
      </UserProvider>
    </>
  )
}
