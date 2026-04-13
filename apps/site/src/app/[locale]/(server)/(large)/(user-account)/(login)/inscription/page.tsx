import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import SigninSignupTabs from '@/components/signIn/SignInSignUpTabs'
import Trans from '@/components/translation/trans/TransServer'
import { SIGNUP_MODE } from '@/constants/authentication/modes'
import { signupComplete } from '@/constants/tracking/pages/mon-espace'
import { captureSignupComplete } from '@/constants/tracking/posthogTrackers'
import { SHOW_WELCOME_BANNER_QUERY_PARAM } from '@/constants/urls/params'
import {
  CONNEXION_PATH,
  INSCRIPTION_PATH,
  MON_ESPACE_PATH,
} from '@/constants/urls/paths'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getUser } from '@/helpers/server/dal/user'
import { UserProvider } from '@/publicodes-state'
import type { DefaultPageProps } from '@/types'
import ColourBlock from '../_components/ColourBlocks'

export const generateMetadata = getCommonMetadata({
  title: t('Création de compte - Nos Gestes Climat'),
  description: t(
    'Connectez-vous à votre espace Nos Gestes Climat pour accéder à vos résultats et comparer vos empreintes carbone avec vos proches.'
  ),
})

export default async function Connexion({ params }: DefaultPageProps) {
  const { locale } = await params

  const { t } = await getServerTranslation({ locale })

  const { id: initialUserId } = await getUser()

  return (
    <div className="flex justify-center pb-32 lg:justify-start">
      <div className="flex flex-col py-6 lg:w-1/2 lg:py-10 lg:pr-7">
        <SigninSignupTabs
          className="-order-1 mb-8 lg:mb-14"
          mode={SIGNUP_MODE}
          paths={{
            sign_in: CONNEXION_PATH,
            sign_up: INSCRIPTION_PATH,
          }}
        />

        <Title
          containerClassName="order-0 max-w-[430px] mb-4"
          title={
            <Trans i18nKey="signup.title" locale={locale}>
              Créez votre espace Nos Gestes Climat
            </Trans>
          }
        />

        <QueryClientProviderWrapper>
          <UserProvider serverUserId={initialUserId}>
            <AuthenticateUserForm
              mode="signUp"
              buttonLabel={t('signup.button.label', "M'inscrire")}
              redirectPathname={`${MON_ESPACE_PATH}?${SHOW_WELCOME_BANNER_QUERY_PARAM}=true`}
              trackers={{
                matomo: signupComplete,
                posthog: captureSignupComplete,
              }}
            />
          </UserProvider>
        </QueryClientProviderWrapper>
      </div>

      <ColourBlock
        className="ml-7 hidden w-1/2 self-start bg-fuchsia-50 lg:flex"
        highlights={[
          <span key="highlight1">
            <Trans
              i18nKey="signup.colourBlock.highlight1.title.prefix"
              locale={locale}>
              Retrouvez
            </Trans>{' '}
            <strong>
              <Trans
                i18nKey="signup.colourBlock.highlight1.title.strong"
                locale={locale}>
                vos résultats d’empreinte
              </Trans>
            </strong>
          </span>,
          <span key="highlight2">
            <Trans
              i18nKey="signup.colourBlock.highlight2.title.prefix"
              locale={locale}>
              Découvrez
            </Trans>{' '}
            <strong>
              <Trans
                i18nKey="signup.colourBlock.highlight2.title.strong1"
                locale={locale}>
                vos actions climat personnalisées
              </Trans>
            </strong>{' '}
            <Trans
              i18nKey="signup.colourBlock.highlight2.title.middle"
              locale={locale}>
              et
            </Trans>{' '}
            <strong>
              <Trans
                i18nKey="signup.colourBlock.highlight2.title.strong2"
                locale={locale}>
                suivez vos progrès
              </Trans>
            </strong>
          </span>,
          <span key="highlight3">
            <strong>
              <Trans
                i18nKey="signup.colourBlock.highlight3.title.strong1"
                locale={locale}>
                Lancez
              </Trans>
            </strong>{' '}
            <Trans
              i18nKey="signup.colourBlock.highlight3.title.middle"
              locale={locale}>
              et
            </Trans>{' '}
            <strong>
              <Trans
                i18nKey="login.colourBlock.login.highlight3.strong2"
                locale={locale}>
                retrouvez vos tests collectifs
              </Trans>
            </strong>{' '}
            <Trans
              i18nKey="login.colourBlock.login.highlight3.end"
              locale={locale}>
              (organisations, famille, amis...)
            </Trans>
          </span>,
        ]}
      />
    </div>
  )
}
