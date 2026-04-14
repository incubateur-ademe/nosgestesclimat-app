'use client'

import type { Group, Participant } from '@/types/groups'

import Trans from '@/components/translation/trans/TransClient'
import { eauMetric } from '@/constants/model/metric'
import Emoji from '@/design-system/utils/Emoji'
import { getTopThreeAndRestMembers } from '@/helpers/groups/getTopThreeAndRestMembers'
import { useUser } from '@/publicodes-state'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import type { QueryObserverResult } from '@tanstack/react-query'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import RankingMember from './ranking/RankingMember'

export default function Ranking({
  group,
  refetchGroup,
  metric,
}: {
  group: Group
  refetchGroup: () => Promise<QueryObserverResult<Group, Error>>
  metric: Metrics
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    user: { userId },
  } = useUser()

  const { topThreeMembers, restOfMembers, membersWithUncompletedSimulations } =
    getTopThreeAndRestMembers(group.participants, metric) || {}

  const withS = group.participants.length - 5 > 1 ? 's' : ''

  const hasOneParticipant = group.participants.length === 1

  return (
    <>
      {metric === eauMetric && (
        <p className="border-primary-200 mb-4 rounded-lg border-2 p-2 text-sm md:max-w-[60%]">
          <Emoji>✨</Emoji>{' '}
          <Trans>
            Voici un aperçu du classement des participants en fonction de leur
            empreinte eau. Cette fonctionnalité est encore en cours de
            développement.
          </Trans>
        </p>
      )}

      <ul
        className={twMerge(
          'mt-2 rounded-xl px-3 py-4',
          hasOneParticipant
            ? 'bg-primary-50 text-primary-700'
            : 'bg-primary-700 text-white',
          metric === eauMetric ? 'bg-primary-300' : ''
        )}>
        {topThreeMembers.map((participant: Participant, index: number) => {
          return (
            <RankingMember
              metric={metric}
              key={participant.id}
              index={index}
              participant={participant}
              isTopThree
              isCurrentMember={participant.userId === userId}
              group={group}
              numberOfParticipants={group.participants.length}
              refetchGroup={refetchGroup}
              textColor={
                metric === eauMetric || hasOneParticipant
                  ? 'text-primary-950'
                  : 'text-white'
              }
            />
          )
        })}
      </ul>

      {restOfMembers.length > 0 && (
        <ul className="px-3 py-4">
          {restOfMembers.length > 0 &&
            [...restOfMembers, ...membersWithUncompletedSimulations]
              .filter(
                (participant: Participant, index: number) =>
                  isExpanded || index + topThreeMembers?.length < 5
              )
              .map((participant: Participant, index: number) => {
                return (
                  <RankingMember
                    key={participant.id}
                    isCurrentMember={participant.userId === userId}
                    group={group}
                    // Add 3 to the index to account for the top three members
                    index={index + 3}
                    refetchGroup={refetchGroup}
                    metric={metric}
                    participant={participant}
                  />
                )
              })}
        </ul>
      )}

      {group.participants.length > 5 && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-Transparent text-primary-700 mt-4 w-full border-none text-center text-sm underline">
          <Trans>
            Voir les {String(group.participants.length - 5)} autre{withS}{' '}
            participant
            {withS}
          </Trans>
        </button>
      )}
    </>
  )
}
