import type { Transaction } from '../../../lib/transaction.ts'
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

/** Removes the administrations that point at the user's verified email. */
export const deleteOrganisationAdministrationsForUser = async (
  { userId }: { userId: string },
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.organisationAdministrator.deleteMany({
    where: { user: { is: { id: userId } } },
  })
}
