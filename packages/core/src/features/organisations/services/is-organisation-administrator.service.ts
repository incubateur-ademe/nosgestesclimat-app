import { findOrganisationAdministrator } from '../repositories/organisation.repository.ts'

/**
 * Whether this user may act on this organisation as one of its administrators.
 *
 * A right, not the organisation: reading the organisation says nothing about
 * the viewer.
 */
export const isOrganisationAdministrator = async ({
  organisationSlug,
  userId,
}: {
  organisationSlug: string
  userId: string
}): Promise<boolean> => {
  const administrator = await findOrganisationAdministrator({
    organisationSlug,
    userId,
  })

  return administrator !== null
}
