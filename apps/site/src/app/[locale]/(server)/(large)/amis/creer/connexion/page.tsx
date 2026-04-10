import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import StepsDisplay from '@/components/groups/StepsDisplay'
import { linkToGroupCreation, SHOW_STEP_KEY } from '@/constants/group'
import {
  amisCreationConnexionComplete,
  amisCreationConnexionRetour,
  captureAmisCreationConnexionComplete,
} from '@/constants/tracking/pages/amisCreation'
import GoBackButton from '@/design-system/inputs/GoBackButton'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { isUserAuthenticated } from '@/helpers/server/model/user'
import type { DefaultPageProps } from '@/types'
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

export default async function GroupConnexionPage({ params }: DefaultPageProps) {
  if (await isUserAuthenticated()) {
    redirect('/amis/creer/votre-groupe')
  }

  const { t } = await getServerTranslation(params)

  return (
    <div className="pb-8">
      <GoBackButton
        eventTracked={amisCreationConnexionRetour}
        className="mb-4 font-bold"
      />

      <StepsDisplay currentStep={1} />

      <Title
        title={t("Créer un groupe d'amis")}
        subtitle={t('Invitez vos proches à passer le test')}
      />

      <AuthenticateUserForm
        redirectURL={`/amis/creer/votre-groupe?${SHOW_STEP_KEY}=true`}
        buttonLabel={t('auth.verifyemail', 'Vérifier mon adresse email')}
        trackers={{
          matomo: amisCreationConnexionComplete,
          posthog: captureAmisCreationConnexionComplete,
        }}
      />
    </div>
  )
}
