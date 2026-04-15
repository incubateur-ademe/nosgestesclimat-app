import StepsDisplay from '@/components/groups/StepsDisplay'
import Trans from '@/components/translation/trans/TransServer'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { organisationAdminGuard } from '../../organisation-guard'
import CloseButton from '../_components/CloseButton'
import PollTypeForm from '../_components/PollTypeForm'

/* global PageProps */
export default async function CreerCampagneTypePage({
  params,
}: PageProps<'/[locale]/organisations/[orgaSlug]/creer-campagne/mode'>) {
  const { orgaSlug, locale } = await params

  const { organisation } = await organisationAdminGuard(orgaSlug)

  const { t } = await getServerTranslation({ locale })

  return (
    <div className="mt-4 mb-16 md:mt-8">
      <div className="mb-4 flex flex-row items-center justify-between">
        <GoBackLink
          href={`/organisations/${orgaSlug}/creer-campagne/informations`}
        />

        <CloseButton t={t} />
      </div>

      <div className="mb-4 flex flex-col justify-between md:flex-nowrap">
        <StepsDisplay currentStep={2} />
        <Title
          title={
            <Trans i18nKey="collectiveTest.mode.title" locale={locale}>
              Choisissez le mode du test
            </Trans>
          }
        />

        <PollTypeForm organisation={organisation} />
      </div>
    </div>
  )
}
