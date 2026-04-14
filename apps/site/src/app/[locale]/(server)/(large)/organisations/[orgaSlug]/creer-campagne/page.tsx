import OrganisationFilAriane from '@/components/layout/FilAriane'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { organisationAdminGuard } from '../organisation-guard'
import PollForm from './_components/PollForm'

/* global PageProps */
export default async function CreerCampagnePage({
  params,
}: PageProps<'/[locale]/organisations/[orgaSlug]/creer-campagne'>) {
  const { orgaSlug, locale } = await params
  const { organisation } = await organisationAdminGuard(orgaSlug)
  const { t } = await getServerTranslation({ locale })
  return (
    <>
      <OrganisationFilAriane
        organisation={organisation}
        t={t}
        isAdmin
        currentPage={{
          label: t('Créer une campagne'),
          href: `/organisations/${orgaSlug}/creer-campagne`,
        }}
      />
      <div className="mb-4 flex flex-col justify-between md:flex-nowrap">
        <Title
          title={<Trans locale={locale}>Créer une campagne</Trans>}
          subtitle={
            <Trans locale={locale}>
              Lancez une campagne de calcul de l'empreinte carbone de vos
              collaborateurs, élèves, collègues...
            </Trans>
          }
        />
        <PollForm organisation={organisation} />
      </div>
    </>
  )
}
