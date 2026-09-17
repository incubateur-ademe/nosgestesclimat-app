import { prisma } from '../../../prisma/client.ts'

/**
 * Keyed on the email because that is the identity `OrganisationAdministrator`
 * links on — it references `VerifiedUser.email`, which is that model's primary
 * key.
 */
export const findOrganisationAdministrator = async ({
  userEmail,
  organisationSlug,
}: {
  userEmail: string
  organisationSlug: string
}): Promise<{ id: string } | null> =>
  prisma.organisationAdministrator.findFirst({
    where: { userEmail, organisation: { slug: organisationSlug } },
    select: { id: true },
  })
