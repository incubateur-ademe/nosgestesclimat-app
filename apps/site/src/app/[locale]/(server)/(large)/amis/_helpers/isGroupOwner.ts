import type { UserSession } from '@/services/auth/get-user-session'
import type { Group } from '@/types/groups'

export const isGroupOwner = (group: Group, user: UserSession): boolean =>
  !!user && group.administrator.id === user.id
