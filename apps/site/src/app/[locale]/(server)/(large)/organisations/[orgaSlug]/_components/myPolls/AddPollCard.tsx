'use client'

import NewItemCardLink from '@/components/cta/NewItemCardLink'
import PlusIcon from '@/components/icons/PlusIcon'
import Trans from '@/components/translation/trans/TransClient'
import { useParams } from 'next/navigation'

interface Props {
  hasNoPollsYet?: boolean
}

export default function AddPollCard({ hasNoPollsYet }: Props) {
  const { orgaSlug } = useParams()

  return (
    <li>
      <NewItemCardLink
        data-testid="add-poll-card"
        href={`/organisations/${orgaSlug as string}/creer-campagne/informations`}
        highlight={!!hasNoPollsYet}
        color={hasNoPollsYet ? 'primary' : 'secondary'}
        imageSrc="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_people_raising_arm_fe915601cd.png"
        imageAlt=""
        label={<Trans>Créer un test collectif</Trans>}
        icon={
          <PlusIcon
            className={
              hasNoPollsYet
                ? 'min-w-8 stroke-white'
                : 'stroke-primary-700 min-w-8'
            }
          />
        }
      />
    </li>
  )
}
