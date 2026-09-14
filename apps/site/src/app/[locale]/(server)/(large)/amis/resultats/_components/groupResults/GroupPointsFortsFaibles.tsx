'use client'

import { useGetGroupStats } from '@/hooks/groups/useGetGroupStats'
import type { Group } from '@/types/groups'
import type { AppUser } from '@nosgestesclimat/core/features/auth/types/user-session'
import PointsFortsFaibles from './PointsFortsFaibles'

/**
 * Les points forts/faibles se calculent dans le navigateur (le moteur publicodes
 * n'existe que là) : cet îlot garde ce calcul côté client pour que la page,
 * elle, puisse rester rendue par le serveur.
 */
export default function GroupPointsFortsFaibles({
  group,
  user,
}: {
  group: Group
  user: AppUser
}) {
  const results = useGetGroupStats({
    groupMembers: group.participants,
    userId: user.id,
  })

  return (
    <PointsFortsFaibles
      pointsFaibles={results?.pointsFaibles}
      pointsForts={results?.pointsForts}
    />
  )
}
