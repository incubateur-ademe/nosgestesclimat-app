'use server'

import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { getUserSession } from '@/services/auth/get-user-session'

export async function getCollectiveTestFlowStatus() {
  const session = await getUserSession()
  const isAuth = session?.isAuth ?? false
  const organisation = isAuth ? await getUserOrganisation() : undefined

  return {
    isAuth,
    hasOrg: !!organisation,
    orgSlug: organisation?.slug,
  }
}
