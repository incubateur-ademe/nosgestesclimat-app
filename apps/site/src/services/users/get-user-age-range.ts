'use server'

import { getUser } from '@/helpers/server/dal/user'
import { getUserAgeRange as getUserAgeRangeService } from '@nosgestesclimat/core/features/users/services/get-user-age-range.service'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'

/**
 * Récupère l'âge (tranche d'âge) de l'utilisateur courant depuis la base de
 * données. Contrairement à la route /users/v1/me qui n'extrait que les données
 * du token JWT (spammée par l'application), celle-ci est une server action
 * appelée ponctuellement lorsqu'on a besoin de l'ageRange.
 *
 * Retourne `null` si l'utilisateur n'a pas encore renseigné son âge.
 */
export async function getUserAgeRange(): Promise<AgeRange | null> {
  const user = await getUser()

  const ageRange = await getUserAgeRangeService(user.id)

  return ageRange
}
