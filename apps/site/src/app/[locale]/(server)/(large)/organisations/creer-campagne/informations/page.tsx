import StepsDisplay from '@/components/groups/StepsDisplay'
import Trans from '@/components/translation/trans/TransServer'
import { ORGANISATION_HOME_PAGE } from '@/constants/urls/paths'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import Title from '@/design-system/layout/Title'
import {
  getCollectiveTestStepNumber,
  getCollectiveTestTotalSteps,
} from '@/helpers/organisations/collectiveTestFlow'
import { getLocaleFromPageParams } from '@/helpers/getLocaleFromPageParams'
import { getCollectiveTestFlowStatus } from '../_actions/getCollectiveTestFlowStatus'
import CloseButton from '../_components/CloseButton'
import PollNameForm from '../_components/PollNameForm'

/* global PageProps */
export default async function CreerCampagneInformationsPage({
  params,
}: PageProps<'/[locale]/organisations/creer-campagne/informations'>) {
  const locale = await getLocaleFromPageParams(params)
  const { isAuth, hasOrg } = await getCollectiveTestFlowStatus()

  return (
    <div className="mt-4 mb-16 md:mt-8">
      <div className="mb-4 flex flex-row justify-between">
        <GoBackLink href={ORGANISATION_HOME_PAGE} />
        <CloseButton />
      </div>

      <div className="mb-4 flex flex-col justify-between md:flex-nowrap">
        <StepsDisplay
          currentStep={getCollectiveTestStepNumber(
            'informations',
            isAuth,
            hasOrg
          )}
          totalSteps={getCollectiveTestTotalSteps(isAuth, hasOrg)}
        />

        <Title
          title={
            <Trans i18nKey="collectiveTest.title" locale={locale}>
              Choisissez un nom pour votre test collectif
            </Trans>
          }
          size="lg"
        />

        <p className="mb-2">
          <Trans locale={locale} i18nKey="collectiveTest.text1">
            Créez un lien personnalisé{' '}
            <strong>à partager dans votre organisation</strong>.
          </Trans>
        </p>

        <p className="mb-8">
          <Trans locale={locale} i18nKey="collectiveTest.text2">
            Les participants passent le test <strong>anonymement</strong> et
            vous accédez à une <strong>synthèse des résultats</strong>.
          </Trans>
        </p>

        <PollNameForm />
      </div>
    </div>
  )
}
