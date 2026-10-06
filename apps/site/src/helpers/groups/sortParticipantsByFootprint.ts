import type { Participant } from '@/types/groups'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import { getParticipantFootprint } from './getParticipantFootprint'

export const sortParticipantsByFootprint = (
  participants: Participant[],
  metric: Metrics
): Participant[] =>
  participants.toSorted((participantA, participantB) => {
    const footprintA = getParticipantFootprint(participantA, metric)
    const footprintB = getParticipantFootprint(participantB, metric)

    if (footprintA === undefined) {
      return footprintB === undefined ? 0 : 1
    }

    if (footprintB === undefined) {
      return -1
    }

    return footprintA - footprintB
  })
