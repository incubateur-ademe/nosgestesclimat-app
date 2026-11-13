import { prisma } from '@nosgestesclimat/core/prisma/client'
import logger, { errorMeta } from '../src/logger.ts'

/**
 * Reports what the "VerifiedUser" deduplication has to do, and what is left of
 * it once it has run.
 *
 * The deduplication itself is the data migration
 * `prisma/migrations/20261112110000_verified_user_deduplicate_ids`, which holds
 * the rule and the writes: rewriting them here would give the runbook a second
 * implementation to keep in sync. This script only reads - the plan below is
 * the same rule stated in SQL, so that the operator can review the outcome of
 * a dry run before `db:migrate` applies it.
 *
 * It is meant to be run twice: before the migration, to review the plan, and
 * after it, to check that no duplicate id, orphaned organisation administrator,
 * or account carrying two organisation administrators is left. It exits with 1
 * when one of those checks fails, which is the expected outcome before the
 * migration runs.
 */

interface PlannedRow {
  id: string
  email: string
  position: number
  hasOrganisationAdministrator: boolean
  lastLoginAt: Date | null
  updatedAt: Date
  action: 'keep' | 'move_organisation_administrator' | 'reassign' | 'delete'
}

const main = async () => {
  try {
    const plan = await fetchPlan()

    logger.info('Deduplication plan', {
      rows: plan.length,
      byAction: plan.reduce<Record<string, number>>((counts, row) => {
        counts[row.action] = (counts[row.action] ?? 0) + 1
        return counts
      }, {}),
    })

    for (const row of plan) {
      logger.info('Deduplication plan row', {
        // The email is the identity being arbitrated: it is reported as is,
        // this is what the operator reviews.
        id: row.id,
        email: row.email,
        position: row.position,
        hasOrganisationAdministrator: row.hasOrganisationAdministrator,
        lastLoginAt: row.lastLoginAt,
        updatedAt: row.updatedAt,
        action: row.action,
      })
    }

    const checks = await fetchChecks()

    const failed = Object.values(checks).some((count) => count > 0)

    if (failed) {
      logger.error('Deduplication checks failed', checks)
    } else {
      logger.info('Deduplication checks passed', checks)
    }

    process.exit(failed ? 1 : 0)
  } catch (error) {
    logger.error('Deduplication report failed', errorMeta(error))
    process.exit(1)
  }
}

main()

/**
 * The rule of the migration, restated as a projection: one row survives per
 * id, the organisation administrator of a row that goes moves to it when that
 * email has none, and a row whose organisation administrator cannot move keeps
 * its email under a fresh id.
 */
const fetchPlan = async (): Promise<PlannedRow[]> => {
  return prisma.$queryRaw<PlannedRow[]>`
    WITH ranked AS (
      SELECT
        "vu"."id",
        "vu"."email",
        "vu"."updatedAt",
        (
          SELECT MAX("vc"."updatedAt")
          FROM "ngc"."VerificationCode" "vc"
          WHERE "vc"."email" = "vu"."email"
            AND "vc"."usage" = 'login'
        ) AS "lastLoginAt",
        EXISTS (
          SELECT 1
          FROM "ngc"."OrganisationAdministrator" "oa"
          WHERE "oa"."userEmail" = "vu"."email"
        ) AS "hasOrganisationAdministrator",
        ROW_NUMBER() OVER (
          PARTITION BY "vu"."id"
          ORDER BY
            (
              SELECT MAX("vc"."updatedAt")
              FROM "ngc"."VerificationCode" "vc"
              WHERE "vc"."email" = "vu"."email"
                AND "vc"."usage" = 'login'
            ) DESC NULLS LAST,
            "vu"."updatedAt" DESC,
            "vu"."email"
        )::int AS "position"
      FROM "ngc"."VerifiedUser" "vu"
      WHERE "vu"."id" IN (
        SELECT "id"
        FROM "ngc"."VerifiedUser"
        GROUP BY "id"
        HAVING COUNT(*) > 1
      )
    ),
    administered AS (
      SELECT
        "ranked"."id",
        "ranked"."email",
        ROW_NUMBER() OVER (
          PARTITION BY "ranked"."id" ORDER BY "ranked"."position"
        )::int AS "administratorPosition"
      FROM "ranked"
      WHERE "ranked"."position" > 1
        AND "ranked"."hasOrganisationAdministrator"
    )
    SELECT
      "ranked"."id",
      "ranked"."email",
      "ranked"."position",
      "ranked"."hasOrganisationAdministrator",
      "ranked"."lastLoginAt",
      "ranked"."updatedAt",
      CASE
        WHEN "ranked"."position" = 1 THEN 'keep'
        -- A row beaten in the arbitration (position > 1) with no
        -- OrganisationAdministrator holds nothing downstream references by
        -- email: deleting it orphans no link and drops no responsibility.
        WHEN NOT "ranked"."hasOrganisationAdministrator" THEN 'delete'
        WHEN "administered"."administratorPosition" = 1
          AND NOT EXISTS (
            SELECT 1
            FROM "ranked" "kept"
            WHERE "kept"."id" = "ranked"."id"
              AND "kept"."position" = 1
              AND "kept"."hasOrganisationAdministrator"
          )
          THEN 'move_organisation_administrator'
        ELSE 'reassign'
      END AS "action"
    FROM "ranked"
    LEFT JOIN "administered"
      ON "administered"."id" = "ranked"."id"
      AND "administered"."email" = "ranked"."email"
    ORDER BY "ranked"."id", "ranked"."position"
  `
}

/**
 * The checks the runbook runs after the migration. Every one of them must be 0
 * for the next ticket - the primary key swap - to go through.
 */
const fetchChecks = async () => {
  const [duplicates] = await prisma.$queryRaw<
    { duplicateIds: number; extraRows: number }[]
  >`
    SELECT
      COUNT(*)::int AS "duplicateIds",
      COALESCE(SUM("rows" - 1), 0)::int AS "extraRows"
    FROM (
      SELECT COUNT(*)::int AS "rows"
      FROM "ngc"."VerifiedUser"
      GROUP BY "id"
      HAVING COUNT(*) > 1
    ) duplicates
  `

  const [orphans] = await prisma.$queryRaw<
    { orphanOrganisationAdministrators: number }[]
  >`
    SELECT COUNT(*)::int AS "orphanOrganisationAdministrators"
    FROM "ngc"."OrganisationAdministrator" "oa"
    WHERE NOT EXISTS (
      SELECT 1
      FROM "ngc"."VerifiedUser" "vu"
      WHERE "vu"."email" = "oa"."userEmail"
    )
  `

  // The next migration makes "OrganisationAdministrator"."userId" unique: two
  // organisation administrators of one account would make it fail.
  const [several] = await prisma.$queryRaw<
    { accountsWithSeveralOrganisationAdministrators: number }[]
  >`
    SELECT COUNT(*)::int AS "accountsWithSeveralOrganisationAdministrators"
    FROM (
      SELECT "vu"."id"
      FROM "ngc"."OrganisationAdministrator" "oa"
      JOIN "ngc"."VerifiedUser" "vu" ON "vu"."email" = "oa"."userEmail"
      GROUP BY "vu"."id"
      HAVING COUNT(*) > 1
    ) accounts
  `

  return {
    duplicateIds: duplicates?.duplicateIds ?? 0,
    extraRows: duplicates?.extraRows ?? 0,
    orphanOrganisationAdministrators:
      orphans?.orphanOrganisationAdministrators ?? 0,
    accountsWithSeveralOrganisationAdministrators:
      several?.accountsWithSeveralOrganisationAdministrators ?? 0,
  }
}
