'use server'

import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { isUserAuthenticated } from '@/helpers/server/model/user'
import { redirect, unauthorized } from 'next/navigation'

/**
 * Checks if the user is authenticated and has access to the specified organisation.
 *
 * @param orgaSlug - The slug of the organisation to check access for.
 * @returns An object containing the organisation if the user is authenticated and has access.
 */

export async function organisationAdminGuard(orgaSlug: string) {
  if (!(await isUserAuthenticated())) {
    redirect('/organisations/connexion')
  }
  const organisation = await getUserOrganisation()
  if (organisation?.slug !== orgaSlug) {
    unauthorized()
  }
  return { organisation }
}
