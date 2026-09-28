import { upsertVerifiedUser } from '../repositories/users.repository.ts'
import type { VerifiedUser } from '../types/user.ts'

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
 * Turns an email into the slug fragment identifying its demo data, so an
 * account, its organisation and its polls all derive from the same stable
 * value.
 */
export const slugifyEmail = (email: string): string =>
  email
    .split('@')[0]
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * The verified account behind a demo email, created when absent.
 */
export const seedVerifiedUser = (email: string): Promise<VerifiedUser> =>
  upsertVerifiedUser({ email })
