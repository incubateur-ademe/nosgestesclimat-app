'use server'

import { throwNextError } from '@/helpers/server/error'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { unauthorized } from 'next/navigation'

/**
 * Checks if the user is authenticated and has access to the specified organisation.
 *
 * @param orgaSlug - The slug of the organisation to check access for.
 * @returns An object containing the organisation if the user is authenticated and has access.
 */

export async function organisationAdminGuard(orgaSlug: string) {
  const organisation = await throwNextError(getUserOrganisation)
  if (organisation?.slug !== orgaSlug) {
    unauthorized()
  }
  return { organisation }
}
