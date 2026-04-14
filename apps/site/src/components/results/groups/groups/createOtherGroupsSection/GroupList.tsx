import type { Group } from '@/types/groups'
import GroupItem from './groupList/GroupItem'

interface Props {
  groups: Group[]
  className?: string
}

export default function GroupList({ groups, className = '' }: Props) {
  return (
    <div className={`flex flex-col ${className}`}>
      {groups.map((group, index) => {
        return (
          <GroupItem key={`group-item-${index}`} group={group} index={index} />
        )
      })}
    </div>
  )
}
