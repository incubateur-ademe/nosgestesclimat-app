'use client'

import type { Group } from '@/types/groups'

import Trans from '@/components/translation/trans/TransClient'
import { eauMetric } from '@/constants/model/metric'
import Emoji from '@/design-system/utils/Emoji'
import { getTopThreeAndRestMembers } from '@/helpers/groups/getTopThreeAndRestMembers'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import type { AppUser } from '@nosgestesclimat/core/features/auth/types/user-session'
import { twMerge } from 'cn'
import { useState } from 'react'
import RankingMember from './ranking/RankingMember'

const MAX_NUMBER_PARTICIPANTS_TO_SHOW_BY_DEFAULT = 5
const PODIUM_SIZE = 3

function getIndexAfterPodium(index: number) {
  return index + PODIUM_SIZE
}

export default function Ranking({
  group,
  metric,
  user,
}: {
  group: Group
  metric: Metrics
  user: AppUser
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const { topThreeMembers, restOfMembers, membersWithUncompletedSimulations } =
    getTopThreeAndRestMembers(group.participants, metric)

  const participantsLength = group.participants.length

  const hasOneParticipant = participantsLength === 1

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
        {topThreeMembers.map((participant, index) => {
          return (
            <RankingMember
              metric={metric}
              key={participant.id}
              index={index}
              participant={participant}
              isTopThree
              isCurrentMember={participant.userId === user.id}
              group={group}
              user={user}
              numberOfParticipants={group.participants.length}
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
          {[...restOfMembers, ...membersWithUncompletedSimulations]
            .filter(
              (participant, index) =>
                isExpanded ||
                index + topThreeMembers.length <
                  MAX_NUMBER_PARTICIPANTS_TO_SHOW_BY_DEFAULT
            )
            .map((participant, index) => {
              return (
                <RankingMember
                  key={participant.id}
                  isCurrentMember={participant.userId === user.id}
                  group={group}
                  user={user}
                  // Add 3 to the index to account for the top three members
                  index={getIndexAfterPodium(index)}
                  metric={metric}
                  participant={participant}
                />
              )
            })}
        </ul>
      )}

      {group.participants.length > MAX_NUMBER_PARTICIPANTS_TO_SHOW_BY_DEFAULT &&
        !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="bg-Transparent text-primary-700 mt-4 w-full border-none text-center text-sm underline">
            <Trans
              i18nKey="group.ranking.expand.button.label"
              values={{
                croppedParticipantsLength:
                  participantsLength -
                  MAX_NUMBER_PARTICIPANTS_TO_SHOW_BY_DEFAULT,
              }}>
              Afficher les{' '}
              {
                {
                  croppedParticipantsLength:
                    participantsLength -
                    MAX_NUMBER_PARTICIPANTS_TO_SHOW_BY_DEFAULT,
                } as unknown as React.ReactNode
              }{' '}
              autres participants
            </Trans>
          </button>
        )}
    </>
  )
}
