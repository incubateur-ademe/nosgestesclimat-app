import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import AuthenticateUserForm from '@/components/authentication/AuthenticateUserForm'
import Trans from '@/components/translation/trans/TransServer'
import { EMAIL_SIMULATOR_PATH, END_PAGE_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { UserProvider } from '@/publicodes-state'
import { getUserSession } from '@/services/auth/get-user-session'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { notFound } from 'next/navigation'
import EmailConfirmation from './_components/EmailConfirmation'
import { getEmailPageData } from './_helpers/getEmailPageData'

export default async function Email({
  params,
  searchParams,
}: PageProps<'/[locale]/simulateur/email'>) {
  const { locale } = await params
  const { confirm } = await searchParams
  const { t } = await getServerTranslation({ locale })

  const user = await getUserSession()

  const currentSimulation = await getCurrentSimulation()
  if (!currentSimulation) {
    notFound()
  }

  const { isSchoolMode, hasContest, organisationName } =
    await getEmailPageData(currentSimulation)

  if (confirm === 'true') {
    return <EmailConfirmation organisationName={organisationName ?? ''} />
  }

  return (
    <>
      <Title
        data-testid="tutoriel-title"
        className="mt-6 text-lg md:mt-10 md:text-2xl"
        title={
          hasContest ? (
            isSchoolMode ? (
              <Trans
                i18nKey="tutorial.email.title.youthContest"
                locale={locale}>
                Ton adresse e-mail pour le tirage au sort
              </Trans>
            ) : (
              <Trans
                i18nKey="tutorial.email.title.defaultContest"
                locale={locale}>
                Votre adresse e-mail pour le tirage au sort
              </Trans>
            )
          ) : isSchoolMode ? (
            <Trans i18nKey="tutorial.email.title.youth" locale={locale}>
              Ton adresse e-mail
            </Trans>
          ) : (
            <Trans i18nKey="tutorial.email.title.default" locale={locale}>
              Votre adresse e-mail
            </Trans>
          )
        }
        subtitle={
          <>
            {hasContest ? (
              <span>
                {isSchoolMode ? (
                  <Trans
                    values={{ organisationName }}
                    i18nKey="tutorial.email.contest.youth"
                    locale={locale}>
                    Vérifie ton e-mail pour le tirage au sort du jeu concours{' '}
                    <strong>{'{{organisationName}}'}</strong>. Tes résultats
                    d’empreinte carbone seront également conservés dans un
                    espace personnel sur Nos Gestes Climat.
                  </Trans>
                ) : (
                  <Trans
                    values={{ organisationName }}
                    i18nKey="tutorial.email.contest.default"
                    locale={locale}>
                    Veuillez vérifier votre adresse e-mail pour le tirage au
                    sort du jeu concours{' '}
                    <strong>{'{{organisationName}}'}</strong>. Vos résultats
                    d’empreinte carbone seront également conservés dans un
                    espace personnel sur Nos Gestes Climat.
                  </Trans>
                )}
              </span>
            ) : isSchoolMode ? (
              <Trans i18nKey="tutorial.email.subtitle.youth" locale={locale}>
                Pour conserver tes résultats et les retrouver à l'avenir dans{' '}
                <strong>ton espace personnel</strong>
              </Trans>
            ) : (
              <Trans i18nKey="tutorial.email.subtitle.default" locale={locale}>
                Pour conserver vos résultats et les retrouver à l'avenir dans{' '}
                <strong>votre espace personnel</strong>
              </Trans>
            )}

            <span className="text-secondary-700 ml-2 inline-block font-bold italic">
              <Trans i18nKey="common.optional" locale={locale}>
                facultatif
              </Trans>
            </span>
          </>
        }
      />
      <UserProvider userSession={user} simulation={currentSimulation}>
        <QueryClientProviderWrapper>
          <AuthenticateUserForm
            inputLabel={
              isSchoolMode ? (
                <Trans i18nKey="tutorial.email.title.youth" locale={locale}>
                  Ton adresse e-mail
                </Trans>
              ) : (
                <Trans i18nKey="tutorial.email.title.default" locale={locale}>
                  Votre adresse e-mail
                </Trans>
              )
            }
            buttonLabel={t(
              'common.authentication.verifyEmail',
              'Vérifier mon adresse e-mail'
            )}
            additionnalButton={
              <ButtonLink
                color="secondary"
                showLoadingOnClick
                href={END_PAGE_PATH}
                data-testid="skip-email-button">
                <Trans i18nKey="common.skip" locale={locale}>
                  Passer
                </Trans>
              </ButtonLink>
            }
            redirectPathname={
              hasContest
                ? `${EMAIL_SIMULATOR_PATH}?confirm=true`
                : END_PAGE_PATH
            }
          />
        </QueryClientProviderWrapper>
      </UserProvider>
    </>
  )
}
