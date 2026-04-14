import type { Group } from '@/types/groups'

interface Props {
  group?: Group
  groupId?: string
}
// Returns the link to the group dashboard. You can pass either a group or a groupId
export const getLinkToGroupDashboard = ({ group, groupId }: Props) =>
  `/amis/resultats?groupId=${group ? group.id : groupId}`

// Returns the link to the group invitation. You can pass either a group or a groupId
export const getLinkToGroupInvitation = ({ group, groupId }: Props) =>
  `/amis/invitation?groupId=${group ? group.id : groupId}`
