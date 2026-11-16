import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'

/**
 * Keyed on the user id, the identity `OrganisationAdministrator` links on: it
 * references `VerifiedUser.id`.
 */
export const findOrganisationAdministrator = async ({
  userId,
  organisationSlug,
}: {
  userId: string
  organisationSlug: string
}): Promise<{ id: string } | null> =>
  prisma.organisationAdministrator.findFirst({
    where: { userId, organisation: { slug: organisationSlug } },
    select: { id: true },
  })

/** Removes the administrations that point at the user. */
export const deleteOrganisationAdministrationsForUser = async (
  { userId }: { userId: string },
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.organisationAdministrator.deleteMany({
    where: { userId },
  })
}
