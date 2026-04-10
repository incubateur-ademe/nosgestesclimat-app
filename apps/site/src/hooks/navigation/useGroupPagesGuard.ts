import {
  getLinkToGroupDashboard,
  getLinkToGroupInvitation,
} from '@/helpers/navigation/groupPages'
import { useFetchGroup } from '@/hooks/groups/useFetchGroup'
import { useGroupIdInQueryParams } from '@/hooks/groups/useGroupIdInQueryParams'
import { useUser } from '@/publicodes-state'
import { isServerSide } from '@/utils/nextjs/isServerSide'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
  isDashboard?: boolean
  // user?: UserServer
}
export function useGroupPagesGuard(
  { isDashboard = false }: Props = { isDashboard: false }
) {
  const router = useRouter()

  const { user } = useUser()

  const { groupIdInQueryParams } = useGroupIdInQueryParams()

  const { data: group } = useFetchGroup(groupIdInQueryParams)

  const isParticipant = !!group?.participants?.some(
    (participant) => participant.userId === user.userId
  )

  useEffect(() => {
    // we only run the guard when the group is fetched (or failed fetching)
    if (!group) return

    // If we are on the dashboard and the user is not a part of the group, we redirect to the invitation page
    if (isDashboard && !isParticipant) {
      router.replace(getLinkToGroupInvitation({ group }))
      return
    }

    // If we are not on the dashboard and the user is a part of the group, we redirect to the dashboard
    if (!isDashboard && isParticipant) {
      router.replace(getLinkToGroupDashboard({ group }))
      return
    }
  }, [group])

  return {
    isGuardRedirecting:
      !!group &&
      (isServerSide() ||
        (isDashboard && !isParticipant) ||
        (!isDashboard && isParticipant) ||
        !groupIdInQueryParams),
  }
}
