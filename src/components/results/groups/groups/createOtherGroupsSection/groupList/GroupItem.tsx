'use client'

import Link from '@/components/Link'
import ChevronRight from '@/components/icons/ChevronRight'
import Trans from '@/components/translation/trans/TransClient'
import { classementClickGroup } from '@/constants/tracking/pages/classements'
import Emoji from '@/design-system/utils/Emoji'
import { getLinkToGroupDashboard } from '@/helpers/navigation/groupPages'
import { useUser } from '@/publicodes-state'
import type { Group } from '@/types/groups'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'

interface Props {
  group: Group
  index: number
}

export default function GroupItem({ group }: Props) {
  const { user } = useUser()
  const isAdministator = user.userId === group.administrator.id

  return (
    <Link
      className="hover:bg-primary-100 mb-3 rounded-xl bg-gray-100 px-5 py-2 no-underline decoration-auto transition-colors"
      href={getLinkToGroupDashboard({ groupId: group.id })}
      onClick={() =>
        trackMatomoEvent__deprecated(
          classementClickGroup({
            isAdministator,
            numParticipants: group.participants.length,
          })
        )
      }>
      <div className="flex items-center justify-between py-4">
        <div className="flex w-full items-center">
          <div className="shrink-0 text-2xl">
            <Emoji>{group.emoji}</Emoji>
          </div>
          <div className="ml-4">
            <div className="text-md font-bold text-gray-900">
              {group.name ?? 'Nom du groupe'}
            </div>
            <div className="flex gap-1 text-sm text-violet-900">
              <span className="whitespace-nowrap">
                {group.participants.length ?? 0} <Trans>participant</Trans>
                {group.participants.length > 1 ? 's' : ''}
              </span>{' '}
              <span> - </span>{' '}
              <div className="inline w-24 overflow-hidden text-ellipsis whitespace-nowrap md:w-60">
                {group.participants
                  ?.map((participant) => participant?.name)
                  .join(', ') ?? ''}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="shrink-0">
            <ChevronRight />
          </div>
        </div>
      </div>
    </Link>
  )
}
