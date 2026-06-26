'use server'

import { getUserSession } from '@/services/auth/get-user-session'
import { getOrganisation } from './get-organisation'

export const isOrganisationAdmin = async (slug: string): Promise<boolean> => {
  const session = await getUserSession()
  if (!session?.isAuth) return false

  const organisation = await getOrganisation(slug)

  return organisation.administrators.some(
    (admin) => admin.email === session.email
  )
}
