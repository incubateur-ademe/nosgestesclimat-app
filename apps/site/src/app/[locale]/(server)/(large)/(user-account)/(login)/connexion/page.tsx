import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import AuthenticateUserForm from '@/components/authentication/AuthenticateUserForm'
import SigninSignupTabs from '@/components/signIn/SignInSignUpTabs'
import Trans from '@/components/translation/trans/TransServer'
import { SIGNIN_MODE } from '@/constants/authentication/modes'
import { captureLoginComplete } from '@/constants/tracking/trackers'
import Title from '@/design-system/layout/Title'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { UserProvider } from '@/publicodes-state'
import { getUserSession } from '@/services/auth/get-user-session'
import type { DefaultPageProps } from '@/types'
import { redirect } from 'next/navigation'
import ColourBlock from '../_components/ColourBlocks'
import { validateSearchParams } from '../_helpers/validateSearchParams'
import { getLoginProps } from './_helpers/getLoginProps'

export const generateMetadata = getCommonMetadata({
  title: t('Connexion à votre espace - Nos Gestes Climat'),
  description: t(
    'Connectez-vous à votre espace Nos Gestes Climat pour accéder à vos résultats et comparer vos empreintes carbone avec vos proches.'
  ),
  alternates: {
    canonical: '/connexion',
  },
})

export default async function Connexion({ searchParams }: DefaultPageProps) {
  const resolvedSearchParams = await searchParams
  const validSearchParams = validateSearchParams(resolvedSearchParams)
  const { labels, redirectPathname } = await getLoginProps(
    validSearchParams?.from
  )

  const userSession = await getUserSession()

  // Also reached right after login: the login action revalidates this page,
  // so the redirect must agree with the one the form performs client-side.
  if (userSession?.isAuth) {
    redirect(redirectPathname)
  }

  return (
    <div className="flex justify-center pb-32 lg:justify-start">
      <div className="flex flex-col py-6 lg:w-1/2 lg:py-10 lg:pr-7">
        <SigninSignupTabs
          className="-order-1 mb-8 lg:mb-14"
          mode={SIGNIN_MODE}
        />

        <Title className="order-0">{labels.title}</Title>

        <QueryClientProviderWrapper>
          <UserProvider userSession={userSession}>
            <AuthenticateUserForm
              intent="create-account"
              mode="signIn"
              redirectPathname={redirectPathname}
              tracker={captureLoginComplete}
              buttonLabel={labels.buttonLabel}
            />
          </UserProvider>
        </QueryClientProviderWrapper>
      </div>

      <ColourBlock
        className="ml-7 hidden w-1/2 self-start lg:flex"
        highlights={[
          <span key="highlight1">
            <Trans i18nKey="login.colourBlock.highlight1.title.prefix">
              Visualisez
            </Trans>{' '}
            <strong>
              <Trans i18nKey="login.colourBlock.highlight1.title.strong">
                vos derniers résultats
              </Trans>
            </strong>
          </span>,
          <span key="highlight2">
            <Trans i18nKey="login.colourBlock.highlight2.title.prefix">
              Continuez à
            </Trans>{' '}
            <strong>
              <Trans i18nKey="login.colourBlock.highlight2.title.strong">
                progresser dans vos actions climat
              </Trans>
            </strong>
          </span>,
          <span key="highlight3">
            <Trans i18nKey="login.colourBlock.highlight3.title.prefix">
              Accédez à
            </Trans>{' '}
            <strong>
              <Trans i18nKey="login.colourBlock.highlight3.title.strong">
                vos défis collectifs
              </Trans>
            </strong>{' '}
            <Trans i18nKey="login.colourBlock.highlight3.title.end">
              en cours
            </Trans>
          </span>,
        ]}
      />
    </div>
  )
}
