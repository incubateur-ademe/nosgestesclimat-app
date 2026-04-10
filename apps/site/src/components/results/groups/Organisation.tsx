import Trans from '@/components/translation/trans/TransClient'
import Title from '@/design-system/layout/Title'
import type { Organisation } from '@/types/organisations'
import CreateOrganisation from './emptyState/CreateOrganisation'
import PollsList from './organisations/PollsList'

export default function OrganisationComponent({
  organisation,
}: {
  organisation: Organisation | undefined
}) {
  return (
    <div className="mb-10 max-w-[683px]">
      {!organisation ? (
        <CreateOrganisation />
      ) : (
        <>
          <Title
            tag="h2"
            title={
              <Trans i18nKey="mon-espace.organisations.title">
                Mes organisations
              </Trans>
            }
          />
          <PollsList organisation={organisation} />
        </>
      )}
    </div>
  )
}
