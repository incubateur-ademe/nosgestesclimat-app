import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import AuthenticateUserForm from '@/components/authentication/AuthenticateUserForm'
import SigninSignupTabs from '@/components/signIn/SignInSignUpTabs'
import Trans from '@/components/translation/trans/TransServer'
import { SIGNUP_MODE } from '@/constants/authentication/modes'
import { captureSignupComplete } from '@/constants/tracking/trackers'
import Title from '@/design-system/layout/Title'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { UserProvider } from '@/publicodes-state'
import { getUserSession } from '@/services/auth/get-user-session'
import type { DefaultPageProps } from '@/types'
import { redirect } from 'next/navigation'
import ColourBlock from '../_components/ColourBlocks'
import { validateSearchParams } from '../_helpers/validateSearchParams'
import { getSignupProps } from './_helpers/getSignUpProps'

export const generateMetadata = getCommonMetadata({
  title: t('Création de compte - Nos Gestes Climat'),
  description: t(
    'Connectez-vous à votre espace Nos Gestes Climat pour accéder à vos résultats et comparer vos empreintes carbone avec vos proches.'
  ),
  alternates: {
    canonical: '/inscription',
  },
})

export default async function Connexion({ searchParams }: DefaultPageProps) {
  const resolvedSearchParams = await searchParams
  const validSearchParams = validateSearchParams(resolvedSearchParams)
  const { labels, redirectPathname } = await getSignupProps(
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
          mode={SIGNUP_MODE}
        />

        <Title
          containerClassName="order-0 max-w-[430px] mb-4"
          title={labels.title}
        />

        <QueryClientProviderWrapper>
          <UserProvider userSession={userSession}>
            <AuthenticateUserForm
              intent="create-account"
              mode="signUp"
              buttonLabel={labels.buttonLabel}
              redirectTo={redirectPathname}
              tracker={captureSignupComplete}
            />
          </UserProvider>
        </QueryClientProviderWrapper>
      </div>

      <ColourBlock
        className="ml-7 hidden w-1/2 self-start bg-fuchsia-50 lg:flex"
        highlights={[
          <span key="highlight1">
            <Trans i18nKey="signup.colourBlock.highlight1.title.prefix">
              Retrouvez
            </Trans>{' '}
            <strong>
              <Trans i18nKey="signup.colourBlock.highlight1.title.strong">
                vos résultats d’empreinte
              </Trans>
            </strong>
          </span>,
          <span key="highlight2">
            <Trans i18nKey="signup.colourBlock.highlight2.title.prefix">
              Découvrez
            </Trans>{' '}
            <strong>
              <Trans i18nKey="signup.colourBlock.highlight2.title.strong1">
                vos actions climat personnalisées
              </Trans>
            </strong>{' '}
            <Trans i18nKey="signup.colourBlock.highlight2.title.middle">
              et
            </Trans>{' '}
            <strong>
              <Trans i18nKey="signup.colourBlock.highlight2.title.strong2">
                suivez vos progrès
              </Trans>
            </strong>
          </span>,
          <span key="highlight3">
            <strong>
              <Trans i18nKey="signup.colourBlock.highlight3.title.strong1">
                Lancez
              </Trans>
            </strong>{' '}
            <Trans i18nKey="signup.colourBlock.highlight3.title.middle">
              et
            </Trans>{' '}
            <strong>
              <Trans i18nKey="login.colourBlock.login.highlight3.strong2">
                retrouvez vos tests collectifs
              </Trans>
            </strong>{' '}
            <Trans i18nKey="login.colourBlock.login.highlight3.end">
              (organisations, famille, amis...)
            </Trans>
          </span>,
        ]}
      />
    </div>
  )
}
