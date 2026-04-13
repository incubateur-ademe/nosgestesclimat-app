import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import Trans from '@/components/translation/trans/TransServer'
import { SIGNIN_MODE } from '@/constants/authentication/modes'
import { loginComplete } from '@/constants/tracking/pages/mon-espace'
import { captureLoginComplete } from '@/constants/tracking/posthogTrackers'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import Title from '@/design-system/layout/Title'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getUser } from '@/helpers/server/dal/user'
import { UserProvider } from '@/publicodes-state'
import type { DefaultPageProps } from '@/types'
import ColourBlock from '../_components/ColourBlocks'
import SigninSignupTabs from '../_components/SigninSignupTabs'

export const generateMetadata = getCommonMetadata({
  title: t('Connexion à votre espace - Nos Gestes Climat'),
  description: t(
    'Connectez-vous à votre espace Nos Gestes Climat pour accéder à vos résultats et comparer vos empreintes carbone avec vos proches.'
  ),
})

export default async function Connexion({ params }: DefaultPageProps) {
  const { locale } = await params
  const { id: initialUserId } = await getUser()

  return (
    <div className="flex justify-center pb-32 lg:justify-start">
      <div className="flex flex-col py-6 lg:w-1/2 lg:py-10 lg:pr-7">
        <SigninSignupTabs
          className="-order-1 mb-8 lg:mb-14"
          mode={SIGNIN_MODE}
        />

        <Title
          containerClassName="order-0 max-w-[430px] mb-4"
          title={
            <Trans i18nKey="login.login.title" locale={locale}>
              Accédez à votre espace Nos Gestes Climat
            </Trans>
          }
        />

        <QueryClientProviderWrapper>
          <UserProvider serverUserId={initialUserId}>
            <AuthenticateUserForm
              mode="signIn"
              redirectPathname={MON_ESPACE_PATH}
              trackers={{
                matomo: loginComplete,
                posthog: captureLoginComplete,
              }}
            />
          </UserProvider>
        </QueryClientProviderWrapper>
      </div>

      <ColourBlock
        className="ml-7 hidden w-1/2 self-start lg:flex"
        highlights={[
          <span key="highlight1">
            <Trans
              i18nKey="login.colourBlock.highlight1.title.prefix"
              locale={locale}>
              Visualisez
            </Trans>{' '}
            <strong>
              <Trans
                i18nKey="login.colourBlock.highlight1.title.strong"
                locale={locale}>
                vos derniers résultats
              </Trans>
            </strong>
          </span>,
          <span key="highlight2">
            <Trans
              i18nKey="login.colourBlock.highlight2.title.prefix"
              locale={locale}>
              Continuez à
            </Trans>{' '}
            <strong>
              <Trans
                i18nKey="login.colourBlock.highlight2.title.strong"
                locale={locale}>
                progresser dans vos actions climat
              </Trans>
            </strong>
          </span>,
          <span key="highlight3">
            <Trans
              i18nKey="login.colourBlock.highlight3.title.prefix"
              locale={locale}>
              Accédez à
            </Trans>{' '}
            <strong>
              <Trans
                i18nKey="login.colourBlock.highlight3.title.strong"
                locale={locale}>
                vos défis collectifs
              </Trans>
            </strong>{' '}
            <Trans
              i18nKey="login.colourBlock.highlight3.title.end"
              locale={locale}>
              en cours
            </Trans>
          </span>,
        ]}
      />
    </div>
  )
}
