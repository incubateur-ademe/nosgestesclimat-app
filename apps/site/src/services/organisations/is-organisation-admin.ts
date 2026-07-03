'use server'

import { ForbiddenError } from '@/helpers/server/error'
import { getUserSession } from '@/services/auth/get-user-session'
import { getOrganisation } from './get-organisation'

export const isOrganisationAdmin = async (slug: string): Promise<boolean> => {
  const session = await getUserSession()
  if (!session?.isAuth) return false

  try {
    await getOrganisation(slug)
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return false
    }
    throw err
  }
  return true
}
