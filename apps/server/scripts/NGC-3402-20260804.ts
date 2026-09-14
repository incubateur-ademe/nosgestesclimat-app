import dotenv from 'dotenv'
import { randomUUID } from 'node:crypto'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import logger, { maskEmail } from '../src/logger.ts'

dotenv.config({ quiet: true })

// Imported lazily so DATABASE_URL (loaded above) is set when the Prisma
// client is instantiated.
const { prisma } = await import('@nosgestesclimat/core/prisma/client')

/**
 * Reassigns a unique id to every `VerifiedUser` sharing the same session id.
 *
 * Background: until the "one session id = one account" fix, the signup path
 * reused the incoming session userId as `VerifiedUser.id` without any
 * uniqueness check. `id` is not unique in the schema, so several accounts
 * ended up attached to the same id, which later made the signin guard reject
 * them with a 403.
 *
 * For each group of accounts sharing an id, one account keeps the id (the one
 * matching the `User` row, which owns profiles/sessions, falling back to the
 * oldest account) and the others get a fresh uuid.
 *
 * What is migrated per reassigned account:
 * - A `User` row is created for the new id (FK target for the re-pointing).
 * - `Simulation` rows are re-pointed by (userId, userEmail) to the new id.
 * - `VerifiedUser.id` is updated.
 */
const findDuplicatedIdGroups = () =>
  prisma.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM ngc."VerifiedUser"
    GROUP BY id
    HAVING COUNT(*) > 1
  `

const main = async () => {
  const { dry } = await yargs(hideBin(process.argv))
    .boolean('dry')
    .alias('d', 'dry')
    .default('dry', true)
    .describe('dry', 'Preview the changes without applying them')
    .parse()

  try {
    const groups = await findDuplicatedIdGroups()
    logger.info('Found duplicated session ids', {
      dry,
      groups: groups.length,
    })

    if (groups.length === 0) {
      logger.info('Nothing to do')
      process.exit(0)
    }

    const ids = groups.map(({ id }) => id)

    // Batch-load the affected accounts and their `User` rows in two queries
    // instead of one per group: `VerifiedUser.id` is not indexed (email is the
    // primary key), so per-group lookups would scan the whole table.
    const affectedVerifiedUsers = await prisma.verifiedUser.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, email: true },
    })
    const userEmailById = new Map(users.map(({ id, email }) => [id, email]))

    // Group the affected accounts by their shared id, keeping the
    // chronological order (createdAt asc) within each group.
    const verifiedUsersById = new Map<string, typeof affectedVerifiedUsers>()
    for (const verifiedUser of affectedVerifiedUsers) {
      const bucket = verifiedUsersById.get(verifiedUser.id)
      if (bucket) {
        bucket.push(verifiedUser)
      } else {
        verifiedUsersById.set(verifiedUser.id, [verifiedUser])
      }
    }

    let reassigned = 0
    let revokedTokens = 0

    for (const { id } of groups) {
      const verifiedUsers = verifiedUsersById.get(id) ?? []
      const userEmail = userEmailById.get(id)

      // One account keeps the session id: the one matching the `User` row
      // (profiles and sessions reference it), falling back to the oldest
      // account.
      const ownerEmail =
        verifiedUsers.find(({ email }) => email === userEmail)?.email ??
        verifiedUsers[0]?.email

      const owner = verifiedUsers.find(({ email }) => email === ownerEmail)
      const reassignments = verifiedUsers
        .filter(({ email }) => email !== ownerEmail)
        .map((verifiedUser) => ({ verifiedUser, newId: randomUUID() }))

      const logOwner = () => {
        if (owner) {
          logger.info('Keeps its session id', {
            email: maskEmail(owner.email),
            id,
          })
        }
      }

      if (dry) {
        revokedTokens += await prisma.refreshToken.count({
          where: { userId: id },
        })
        logOwner()
        for (const { verifiedUser, newId } of reassignments) {
          reassigned++
          logger.info('Would reassign a new id', {
            email: maskEmail(verifiedUser.email),
            from: id,
            to: newId,
          })
        }
        continue
      }

      // One transaction per group: revoke every refresh token of the shared
      // id (they only store userId + token hash, so the owner's tokens are
      // indistinguishable from the others'), then move the non-owner
      // accounts. Atomic: a failure leaves the group untouched.
      await prisma.$transaction(async (tx) => {
        const { count } = await tx.refreshToken.deleteMany({
          where: { userId: id },
        })
        revokedTokens += count

        logOwner()

        for (const { verifiedUser, newId } of reassignments) {
          // `Simulation.userId` references `User.id`; create the target row
          // before re-pointing.
          await tx.user.create({
            data: {
              id: newId,
              email: verifiedUser.email,
              name: verifiedUser.name,
              createdAt: verifiedUser.createdAt,
            },
          })

          await tx.simulation.updateMany({
            where: { userId: id, userEmail: verifiedUser.email },
            data: { userId: newId },
          })

          await tx.verifiedUser.update({
            where: { email: verifiedUser.email },
            data: { id: newId },
          })

          reassigned++
          logger.info('Reassigned a new id', {
            email: maskEmail(verifiedUser.email),
            from: id,
            to: newId,
          })
        }
      })
    }

    const remaining = await prisma.$queryRaw<{ count: string }[]>`
      SELECT COUNT(*)::text AS count
      FROM (
        SELECT id
        FROM ngc."VerifiedUser"
        GROUP BY id
        HAVING COUNT(*) > 1
      ) sub
    `
    logger.info('Finished', {
      dry,
      reassigned,
      revokedTokens,
      remainingDuplicatedIds: remaining[0]?.count ?? '0',
    })
    process.exit(0)
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

main()
