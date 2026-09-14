import { findOrganisationAdministrator } from '../repositories/organisation.repository.ts'

/**
 * Whether this user may act on this organisation as one of its administrators.
 *
 * Answers with a right rather than with the organisation itself: reading the
 * organisation tells nothing about the viewer, so gating an admin section needs
 * this question asked separately.
 */
export const isOrganisationAdministrator = async ({
  organisationSlug,
  userEmail,
}: {
  organisationSlug: string
  userEmail: string
}): Promise<boolean> => {
  const administrator = await findOrganisationAdministrator({
    organisationSlug,
    userEmail,
  })

  return administrator !== null
}
