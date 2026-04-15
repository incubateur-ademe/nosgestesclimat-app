import StepsDisplay from '@/components/groups/StepsDisplay'
import CloseIcon from '@/components/icons/Close'
import Trans from '@/components/translation/trans/TransServer'
import Button from '@/design-system/buttons/Button'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { organisationAdminGuard } from '../../organisation-guard'
import PollTypeForm from '../_components/PollTypeForm'

/* global PageProps */
export default async function CreerCampagneTypePage({
  params,
}: PageProps<'/[locale]/organisations/[orgaSlug]/creer-campagne/type'>) {
  const { orgaSlug, locale } = await params
  const { organisation } = await organisationAdminGuard(orgaSlug)
  const { t } = await getServerTranslation({ locale })
  return (
    <>
      <div className="mb-4 flex flex-row justify-between">
        <GoBackLink
          href={`/organisations/${orgaSlug}/creer-campagne/informations`}
        />

        <Button
          color="secondary"
          aria-label={t(
            'organisations.createPoll.type.closeButton',
            "Abandonner le processus de création de test collectif et revenir à la page d'accueil de votre organisation"
          )}
          className="rounded-full">
          <CloseIcon />
        </Button>
      </div>
      <div className="mb-4 flex flex-col justify-between md:flex-nowrap">
        <StepsDisplay currentStep={1} />
        <Title
          title={
            <Trans i18nKey="collectiveTest.mode.title" locale={locale}>
              Choisissez le mode du test
            </Trans>
          }
        />

        <PollTypeForm organisation={organisation} />
      </div>
    </>
  )
}
