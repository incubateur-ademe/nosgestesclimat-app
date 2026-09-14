import type { Group } from '@/types/groups'
import type { UserSession } from '@nosgestesclimat/core/features/auth/types/user-session'

export const isGroupOwner = (group: Group, user: UserSession): boolean =>
  !!user && group.administrator.id === user.id
