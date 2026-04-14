import Trans from '@/components/translation/trans/TransClient'
import type { Organisation } from '@/types/organisations'
import OrganisationItem from './pollList/OrganisationItem'

interface Props {
  organisation: Organisation
}

export default function PollsList({ organisation }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-3" data-testid="poll-list">
      {!!organisation && (
        <>
          <h3 className="mb-0 text-base">
            <Trans>Mon organisation</Trans>
          </h3>
          <OrganisationItem organisation={organisation} />
        </>
      )}
    </div>
  )
}
