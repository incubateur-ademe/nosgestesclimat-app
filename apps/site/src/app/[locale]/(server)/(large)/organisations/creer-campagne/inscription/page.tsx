import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import StepsDisplay from '@/components/groups/StepsDisplay'
import SigninSignupTabs from '@/components/signIn/SignInSignUpTabs'
import Trans from '@/components/translation/trans/TransServer'
import { SIGNUP_MODE } from '@/constants/authentication/modes'
import {
  captureOrganisationsLoginComplete,
  organisationsLoginComplete,
} from '@/constants/tracking/pages/organisationsConnexion'
import {
  COLLECTIVE_TEST_FINALISER_PATH,
  COLLECTIVE_TEST_MODE_PATH,
  COLLECTIVE_TEST_ORGANISATION_PATH,
} from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import Title from '@/design-system/layout/Title'
import { getLocaleFromPageParams } from '@/helpers/getLocaleFromPageParams'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import {
  getCollectiveTestStepNumber,
  getCollectiveTestTotalSteps,
} from '@/helpers/organisations/collectiveTestFlow'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { redirect } from 'next/navigation'
import { getCollectiveTestFlowStatus } from '../_actions/getCollectiveTestFlowStatus'
import CloseButton from '../_components/CloseButton'

async function redirectAfterSignupInFlow() {
  'use server'
  const organisation = await getUserOrganisation()
  if (!organisation) {
    redirect(COLLECTIVE_TEST_ORGANISATION_PATH)
  }
  redirect(COLLECTIVE_TEST_FINALISER_PATH)
}

/* global PageProps */
export default async function CollectiveTestInscriptionPage({
  params,
}: PageProps<'/[locale]/organisations/creer-campagne/inscription'>) {
  const locale = await getLocaleFromPageParams(params)
  const { isAuth, hasOrg } = await getCollectiveTestFlowStatus()

  if (isAuth) {
    if (hasOrg) {
      redirect(COLLECTIVE_TEST_FINALISER_PATH)
    }
    redirect(COLLECTIVE_TEST_ORGANISATION_PATH)
  }

  const { t } = await getServerTranslation({ locale })

  return (
    <div className="mt-4 mb-16 md:mt-8">
      <div className="mb-4 flex flex-row justify-between">
        <GoBackLink href={COLLECTIVE_TEST_MODE_PATH} />
        <CloseButton />
      </div>

      <StepsDisplay
        currentStep={getCollectiveTestStepNumber('connexion', isAuth, hasOrg)}
        totalSteps={getCollectiveTestTotalSteps(isAuth, hasOrg)}
      />

      <Title
        size="lg"
        title={
          <Trans i18nKey="organisations.inscription.title" locale={locale}>
            Connectez-vous pour diffuser votre lien de test collectif
          </Trans>
        }
      />

      <p className="mb-8 max-w-full md:w-160">
        <Trans i18nKey="organisations.inscription.subtitle" locale={locale}>
          Pour diffuser votre test collectif à vos élèves, vos étudiants, vos
          collègues ou vos clients, il vous suffit de créer votre espace
          personnel sécurisé. Accédez ensuite aux résultats des participants
          sous forme de graphiques comparatifs.
        </Trans>
      </p>

      <div className="max-w-full md:w-160">
        <SigninSignupTabs
          className="-order-1 mb-8 lg:mb-14"
          mode={SIGNUP_MODE}
        />
        <AuthenticateUserForm
          onComplete={redirectAfterSignupInFlow}
          trackers={{
            matomo: organisationsLoginComplete,
            posthog: captureOrganisationsLoginComplete,
          }}
          buttonLabel={t('organisations.inscription.cta', 'Créer mon compte')}
        />
      </div>
    </div>
  )
}
