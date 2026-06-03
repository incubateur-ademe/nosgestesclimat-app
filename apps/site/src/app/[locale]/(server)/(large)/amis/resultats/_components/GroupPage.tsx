'use client'

import GroupLoader from '@/components/groups/GroupLoader'

import GroupNotFound from '@/components/groups/GroupNotFound'
import { useFetchGroup } from '@/hooks/groups/useFetchGroup'
import { useGroupIdInQueryParams } from '@/hooks/groups/useGroupIdInQueryParams'
import type { ReactNode } from 'react'
import EditableGroupTitle from './EditableGroupTitle'
import GroupResults from './GroupResults'
import UpdateSimulationUsed from './UpdateSimulationUsed'

export default function GroupPage({
  categoriesAccordion,
}: {
  categoriesAccordion?: ReactNode
}) {
  const { groupIdInQueryParams } = useGroupIdInQueryParams()
  const {
    data: group,
    isLoading,
    isError,
    refetch: refetchGroup,
  } = useFetchGroup(groupIdInQueryParams)
  if (isLoading) {
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

      <GroupResults
        group={group}
        refetchGroup={refetchGroup}
        categoriesAccordion={categoriesAccordion}
      />
    </>
  )
}
