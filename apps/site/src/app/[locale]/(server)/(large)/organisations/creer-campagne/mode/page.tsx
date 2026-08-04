import StepsDisplay from '@/components/groups/StepsDisplay'
import Trans from '@/components/translation/trans/TransServer'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import Title from '@/design-system/layout/Title'
import { COLLECTIVE_TEST_INFORMATIONS_PATH } from '@/constants/urls/paths'
import {
  getCollectiveTestStepNumber,
  getCollectiveTestTotalSteps,
} from '@/helpers/organisations/collectiveTestFlow'
import { getLocaleFromPageParams } from '@/helpers/getLocaleFromPageParams'
import { getCollectiveTestFlowStatus } from '../_actions/getCollectiveTestFlowStatus'
import CloseButton from '../_components/CloseButton'
import PollModeForm from '../_components/PollModeForm'

/* global PageProps */
export default async function CreerCampagneModePage({
  params,
}: PageProps<'/[locale]/organisations/creer-campagne/mode'>) {
  const locale = await getLocaleFromPageParams(params)
  const { isAuth, hasOrg } = await getCollectiveTestFlowStatus()

  return (
    <div className="mt-4 mb-16 md:mt-8">
      <div className="mb-4 flex flex-row items-center justify-between">
        <GoBackLink href={COLLECTIVE_TEST_INFORMATIONS_PATH} />
        <CloseButton />
      </div>

      <div className="mb-4 flex flex-col justify-between md:flex-nowrap">
        <StepsDisplay
          currentStep={getCollectiveTestStepNumber('mode', isAuth, hasOrg)}
          totalSteps={getCollectiveTestTotalSteps(isAuth, hasOrg)}
        />
        <Title
          title={
            <Trans i18nKey="collectiveTest.mode.title" locale={locale}>
              Choisissez le mode du test
            </Trans>
          }
          size="lg"
        />

        <PollModeForm />
      </div>
    </div>
  )
}
