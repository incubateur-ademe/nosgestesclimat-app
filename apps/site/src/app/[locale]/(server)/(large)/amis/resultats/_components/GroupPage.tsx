'use client'

import GroupLoader from '@/components/groups/GroupLoader'

import GroupNotFound from '@/components/groups/GroupNotFound'
import { useFetchGroup } from '@/hooks/groups/useFetchGroup'
import { useGroupIdInQueryParams } from '@/hooks/groups/useGroupIdInQueryParams'
import { useGroupPagesGuard } from '@/hooks/navigation/useGroupPagesGuard'
import EditableGroupTitle from './EditableGroupTitle'
import GroupResults from './GroupResults'
import UpdateSimulationUsed from './UpdateSimulationUsed'

export default function GroupPage() {
  // Guarding the route and redirecting if necessary
  const { isGuardRedirecting } = useGroupPagesGuard({
    isDashboard: true,
  })

  const { groupIdInQueryParams } = useGroupIdInQueryParams()
  const {
    data: group,
    isLoading,
    isError,
    refetch: refetchGroup,
  } = useFetchGroup(groupIdInQueryParams)
  console.log(group?.participants)
  // If we are still fetching the group (or we are redirecting the user), we display a loader
  if (isGuardRedirecting || isLoading) {
    return <GroupLoader />
  }

  // If the group doesn't exist, we display a 404 page
  if (!group || isError) {
    return <GroupNotFound />
  }

  return (
    <>
      <EditableGroupTitle group={group} />

      <UpdateSimulationUsed group={group} refetchGroup={refetchGroup} />

      <GroupResults group={group} refetchGroup={refetchGroup} />
    </>
  )
}
