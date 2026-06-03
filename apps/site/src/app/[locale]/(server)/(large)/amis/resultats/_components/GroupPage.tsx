'use client'

import type { Group } from '@/types/groups'
import type { ReactNode } from 'react'
import EditableGroupTitle from './EditableGroupTitle'
import GroupResults from './GroupResults'
import UpdateSimulationUsed from './UpdateSimulationUsed'

export default function GroupPage({
  group,
  categoriesAccordion,
}: {
  group: Group
  categoriesAccordion?: ReactNode
}) {
  return (
    <>
      <EditableGroupTitle group={group} />

      <UpdateSimulationUsed group={group} />

      <GroupResults group={group} categoriesAccordion={categoriesAccordion} />
    </>
  )
}
