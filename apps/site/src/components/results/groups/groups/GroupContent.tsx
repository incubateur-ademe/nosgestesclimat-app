import type { Group } from '@/types/groups'
import CreateFirstGroupSection from './CreateFirstGroupSection'
import GroupList from './createOtherGroupsSection/GroupList'

interface Props {
  groups?: Group[]
}

export default function GroupContent({ groups }: Props) {
  if (groups?.length === 0 || !groups) {
    return <CreateFirstGroupSection />
  }
  return <GroupList groups={groups} />
}
