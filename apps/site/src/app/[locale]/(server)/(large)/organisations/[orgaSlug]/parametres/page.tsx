import Trans from '@/components/translation/trans/TransClient'
import Title from '@/design-system/layout/Title'

import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import OrganisationFilAriane from '@/components/layout/FilAriane'
import { ADMINISTRATOR_SEPARATOR } from '@/constants/organisations/administrator'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type {
  Organisation,
  OrgaSettingsInputsType,
} from '@/types/organisations'
import { organisationAdminGuard } from '../organisation-guard'
import OrganisationForm from './_components/OrganisationForm'

export default async function ParametresPage({
  params,
}: PageProps<'/[locale]/organisations/[orgaSlug]/parametres'>) {
  const { orgaSlug, locale } = await params
  const { organisation } = await organisationAdminGuard(orgaSlug)
  const { t } = await getServerTranslation({ locale })
  const defaultValues = getFormDefaultValues(organisation)

  return (
    <>
      <OrganisationFilAriane
        organisation={organisation}
        t={t}
        isAdmin
        currentPage={{
          label: t('Paramètres'),
          href: `/organisations/${orgaSlug}/parametres`,
        }}
      />

      <div className="pb-12">
        <Title
          title={
            <span>
              <Trans>Paramètres de </Trans>
              <strong className="text-primary-700">{organisation.name}</strong>
            </span>
          }
        />
        <QueryClientProviderWrapper>
          <OrganisationForm
            slug={organisation.slug}
            defaultValues={defaultValues}
          />
        </QueryClientProviderWrapper>
      </div>
    </>
  )
}

const getFormDefaultValues = (
  organisation: Organisation
): OrgaSettingsInputsType => {
  const {
    administrators: [
      { position, name: administratorName, telephone: administratorTelephone },
    ],
    numberOfCollaborators,
    type: organisationType,
    name,
  } = organisation

  const [administratorFirstName, administratorLastName] =
    administratorName?.split(ADMINISTRATOR_SEPARATOR) ?? []

  return {
    name,
    numberOfCollaborators: numberOfCollaborators ?? 0,
    organisationType,
    ...(position ? { position } : {}),
    ...(administratorName
      ? {
          administratorFirstName,
          administratorLastName,
        }
      : {}),
    ...(administratorTelephone ? { administratorTelephone } : {}),
  }
}
