import { prisma } from '../../../prisma/client.ts'

/**
 * The demo accounts a seed run creates, read from `SEED_ADMIN_EMAILS`.
 *
 * Optional: without it, the seed only creates what does not depend on an
 * account (the default event), which is what a database that is not meant to
 * hold a demo login needs. Reading it is never the seed's reason to fail.
 */
export const readSeedAdminEmails = (): string[] =>
  (process.env.SEED_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLocaleLowerCase())
    .filter(Boolean)

/**
 * Whether a previous run already created any of these accounts. The seed is
 * idempotent by skipping entirely in that case, rather than by trying to upsert
 * its way through partially seeded data.
 */
export const haveSeedUsers = async (emails: string[]): Promise<boolean> => {
  const count = await prisma.verifiedUser.count({
    where: { email: { in: emails } },
  })

  return count > 0
}
