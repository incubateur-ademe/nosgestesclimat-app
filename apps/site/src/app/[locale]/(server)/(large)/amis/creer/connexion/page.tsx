import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import AuthenticateUserForm from '@/components/authentication/AuthenticateUserForm'
import StepsDisplay from '@/components/groups/StepsDisplay'
import Trans from '@/components/translation/trans/TransServer'
import { linkToGroupCreation, SHOW_STEP_KEY } from '@/constants/group'
import { captureAmisCreationConnexionComplete } from '@/constants/tracking/trackers'
import GoBackButton from '@/design-system/inputs/GoBackButton'
import Subtitle from '@/design-system/layout/Subtitle'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { UserProvider } from '@/publicodes-state'
import { getUserSession } from '@/services/auth/get-user-session'
import { redirect } from 'next/navigation'

export const generateMetadata = getCommonMetadata({
  title: t('Créer un groupe, étape 1 sur 2 - Nos Gestes Climat'),
  description: t(
    "Calculez votre empreinte carbone en groupe et comparez la avec l'empreinte de vos proches grâce au calculateur de bilan carbone personnel Nos Gestes Climat."
  ),
  alternates: {
    canonical: linkToGroupCreation,
  },
})

export default async function GroupConnexionPage() {
  const userSession = await getUserSession()

  if (userSession?.isAuth) {
    redirect('/amis/creer/votre-groupe')
  }

  const { t } = await getServerTranslation()

  return (
    <div className="pb-8">
      <GoBackButton className="mb-4 font-bold" />

      <StepsDisplay currentStep={1} />

      <Title className="mb-2">
        <Trans>Créer un groupe d'amis</Trans>
      </Title>

      <Subtitle>
        <Trans>Invitez vos proches à passer le test</Trans>
      </Subtitle>

      <QueryClientProviderWrapper>
        <UserProvider userSession={userSession}>
          <AuthenticateUserForm
            intent="create-group"
            redirectPathname={`/amis/creer/votre-groupe?${SHOW_STEP_KEY}=true`}
            buttonLabel={t('auth.verifyemail', 'Vérifier mon adresse email')}
            tracker={captureAmisCreationConnexionComplete}
          />
        </UserProvider>
      </QueryClientProviderWrapper>
    </div>
  )
}
