import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import StepsDisplay from '@/components/groups/StepsDisplay'
import SigninSignupTabs from '@/components/signIn/SignInSignUpTabs'
import Trans from '@/components/translation/trans/TransServer'
import { SIGNIN_MODE } from '@/constants/authentication/modes'
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
import Separator from '@/design-system/layout/Separator'
import Title from '@/design-system/layout/Title'
import {
  getCollectiveTestStepNumber,
  getCollectiveTestTotalSteps,
} from '@/helpers/organisations/collectiveTestFlow'
import { getLocaleFromPageParams } from '@/helpers/getLocaleFromPageParams'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { redirect } from 'next/navigation'
import { getCollectiveTestFlowStatus } from '../_actions/getCollectiveTestFlowStatus'
import CloseButton from '../_components/CloseButton'

async function redirectAfterLoginInFlow() {
  'use server'
  const organisation = await getUserOrganisation()
  if (!organisation) {
    redirect(COLLECTIVE_TEST_ORGANISATION_PATH)
  }
  redirect(COLLECTIVE_TEST_FINALISER_PATH)
}

/* global PageProps */
export default async function CollectiveTestConnexionPage({
  params,
}: PageProps<'/[locale]/organisations/creer-campagne/connexion'>) {
  const locale = await getLocaleFromPageParams(params)
  const { isAuth, hasOrg } = await getCollectiveTestFlowStatus()

  if (isAuth) {
    if (hasOrg) {
      redirect(COLLECTIVE_TEST_FINALISER_PATH)
    }
    redirect(COLLECTIVE_TEST_ORGANISATION_PATH)
  }

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
          <Trans i18nKey="organisations.connexion.title" locale={locale}>
            Connectez-vous pour diffuser votre lien de test collectif
          </Trans>
        }
      />

      <p className="mb-8 max-w-full md:w-160">
        <Trans i18nKey="organisations.connexion.subtitle" locale={locale}>
          Pour diffuser votre test collectif à vos élèves, vos étudiants, vos
          collègues ou vos clients, il vous suffit de créer votre espace
          personnel sécurisé. Accédez ensuite aux résultats des participants
          sous forme de graphiques comparatifs.
        </Trans>
      </p>

      <Separator />

      <div className="max-w-full md:w-160">
        <SigninSignupTabs className="-order-1 mb-8 lg:mb-14" mode={SIGNIN_MODE} />
        <AuthenticateUserForm
          onComplete={redirectAfterLoginInFlow}
          trackers={{
            matomo: organisationsLoginComplete,
            posthog: captureOrganisationsLoginComplete,
          }}
        />
      </div>
    </div>
  )
}
