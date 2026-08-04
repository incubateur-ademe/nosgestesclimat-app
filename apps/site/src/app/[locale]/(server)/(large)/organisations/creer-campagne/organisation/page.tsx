import StepsDisplay from '@/components/groups/StepsDisplay'
import Trans from '@/components/translation/trans/TransServer'
import {
  COLLECTIVE_TEST_CONNEXION_PATH,
  COLLECTIVE_TEST_FINALISER_PATH,
  COLLECTIVE_TEST_MODE_PATH,
} from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import Title from '@/design-system/layout/Title'
import { getLocaleFromPageParams } from '@/helpers/getLocaleFromPageParams'
import {
  getCollectiveTestStepNumber,
  getCollectiveTestTotalSteps,
} from '@/helpers/organisations/collectiveTestFlow'
import { requireAuthUser } from '@/services/auth/require-auth-user'
import { redirect } from 'next/navigation'
import { getCollectiveTestFlowStatus } from '../_actions/getCollectiveTestFlowStatus'
import CloseButton from '../_components/CloseButton'
import OrganisationCreationForm from '../_components/OrganisationCreationForm'

/* global PageProps */
export default async function CollectiveTestOrganisationPage({
  params,
}: PageProps<'/[locale]/organisations/creer-campagne/organisation'>) {
  const locale = await getLocaleFromPageParams(params)
  await requireAuthUser({ redirect: COLLECTIVE_TEST_CONNEXION_PATH })

  const { isAuth, hasOrg } = await getCollectiveTestFlowStatus()

  if (hasOrg) {
    redirect(COLLECTIVE_TEST_FINALISER_PATH)
  }

  return (
    <div className="mt-4 mb-16 md:mt-8">
      <div className="mb-4 flex flex-row justify-between">
        <GoBackLink href={COLLECTIVE_TEST_MODE_PATH} />
        <CloseButton />
      </div>

      <StepsDisplay
        currentStep={getCollectiveTestStepNumber(
          'organisation',
          isAuth,
          hasOrg
        )}
        totalSteps={getCollectiveTestTotalSteps(isAuth, hasOrg)}
      />

      <Title
        className="mb-6"
        size="lg"
        hasSeparator={false}
        title={
          <Trans locale={locale}>
            Pour finir, donnez un nom à votre organisation
          </Trans>
        }
      />

      <OrganisationCreationForm />
    </div>
  )
}
