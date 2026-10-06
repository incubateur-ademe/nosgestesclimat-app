import type { Metric } from '@/publicodes-state/types'
import type { Participant } from '@/types/groups'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import { getParticipantFootprint } from './getParticipantFootprint'
import { sortParticipantsByFootprint } from './sortParticipantsByFootprint'

function isInTopThree({
  topThreeMembers,
  currentMember,
  metric,
}: {
  topThreeMembers: Participant[]
  currentMember: Participant
  metric: Metric
}) {
  return (
    topThreeMembers.length < 3 &&
    getParticipantFootprint(currentMember, metric) !== undefined
  )
}

export const getTopThreeAndRestMembers = (
  members: Participant[] = [],
  metric: Metrics
) =>
  sortParticipantsByFootprint(members, metric).reduce<{
    topThreeMembers: Participant[]
    restOfMembers: Participant[]
    membersWithUncompletedSimulations: Participant[]
  }>(
    (acc, member) => {
      // We store apart the members with uncompleted simulations
      if (member.simulation.progression !== 1) {
        acc.membersWithUncompletedSimulations.push(member)
        return acc
      }

      if (
        isInTopThree({
          topThreeMembers: acc.topThreeMembers,
          currentMember: member,
          metric,
        })
      ) {
        acc.topThreeMembers.push(member)
      } else {
        acc.restOfMembers.push(member)
      }
      return acc
    },
    {
      topThreeMembers: [],
      restOfMembers: [],
      membersWithUncompletedSimulations: [],
    }
  )
