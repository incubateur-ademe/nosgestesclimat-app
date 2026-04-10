import { GROUP_URL } from '@/constants/urls/main'
import { getInitialExtendedSituation } from '@/helpers/modelFetching/getInitialExtendedSituation'
import { useUser } from '@/publicodes-state'
import type { Group, Participant } from '@/types/groups'
import { unformatSituation } from '@/utils/formatDataForDB'
import type { UseQueryResult } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function useFetchGroup(
  groupId?: string | null
): UseQueryResult<Group, Error> {
  const {
    user: { userId },
  } = useUser()

  return useQuery({
    queryKey: ['groups', userId, groupId],
    queryFn: () =>
      axios
        .get(`${GROUP_URL}/${userId}/${groupId}`)
        .then((response) => response.data)
        .then((data) => {
          return {
            ...data,
            participants: data.participants.map((participant: Participant) => {
              const simulation = {
                ...participant.simulation,
                situation: unformatSituation(participant.simulation.situation),
              }

              // Ensure extendedSituation is always defined (for old simulations that might not have it)
              if (!simulation.extendedSituation) {
                simulation.extendedSituation = getInitialExtendedSituation()
              }

              return {
                ...participant,
                simulation,
              }
            }),
          }
        }),
    refetchInterval: 60000,
    enabled: !!groupId,
  })
}
