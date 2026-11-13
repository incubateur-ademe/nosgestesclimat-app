import { prisma } from '@nosgestesclimat/core/prisma/client'
import { parseArgs } from 'node:util'
import logger, { errorMeta } from '../src/logger.ts'

/**
 * Deduplicates the "VerifiedUser" rows that share an id: the data repair a
 * primary key on "id" requires.
 *
 * The id used to be copied from the session, and a sign-up holding a verified
 * session reused that session's id: an account can therefore carry one row per
 * email it was verified with, all sharing the id and, through it, the same
 * simulations and tokens.
 *
 * One row survives per duplicated id: the email with the most recent login
 * code, then the most recently updated row, then the email alphabetically. The
 * last two break ties so that the outcome does not depend on the order rows
 * are read in - the surviving email is the one the person logs in with.
 *
 * The organisation administrators follow the surviving email: an
 * "OrganisationAdministrator" row is unique per email, so one cannot be left
 * pointing at a deleted email. Where two emails of the same id both administer
 * an organisation, the extra row keeps its email and is handed a fresh id,
 * along with the "User" row that id needs: the two organisation administrators
 * belong to two distinct accounts from now on, leaving the id with a single
 * administration.
 *
 * Dry mode is the default: the script reports the arbitration plan and writes
 * nothing. Run with --no-dry to apply it. A dry run always exits with 0; an
 * apply exits with 1 when a duplicate id, an orphaned organisation
 * administrator or an account carrying two organisation administrators is
 * left.
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

interface DeduplicationChecks {
  duplicateIds: number
  extraRows: number
  orphanOrganisationAdministrators: number
  accountsWithSeveralOrganisationAdministrators: number
}

/**
 * The subset of the client the script uses, so that the test can run it on its
 * own database.
 */
export interface DeduplicationClient {
  $queryRawUnsafe<T = unknown>(query: string): Promise<T>
  $executeRawUnsafe(query: string): Promise<unknown>
  $transaction(
    transaction: (
      tx: Pick<DeduplicationClient, '$executeRawUnsafe'>
    ) => Promise<void>,
    options?: { timeout?: number }
  ): Promise<unknown>
}

/** The statements scan the whole table: the default transaction timeout is too
 * short. */
const TRANSACTION_TIMEOUT = 10 * 60 * 1000

/**
 * The rule, stated as a projection: one row survives per id, the organisation
 * administrator of a row that goes moves to it when that email has none, and a
 * row whose organisation administrator cannot move keeps its email under a
 * fresh id.
 */
const PLAN_SQL = /* sql */ `
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

/**
 * The writes the plan is applied with, in order, inside one transaction.
 *
 * The organisation administrator of an extra row moves to the surviving email
 * of its account, which frees the extra row to be deleted. A fresh identity
 * gets its "User" row first, because "VerifiedUser"."id" is a foreign key to it.
 */
const STATEMENTS = [
  /* sql */ `
  -- The rows to arbitrate, ranked within their id.
  CREATE TEMPORARY TABLE "duplicate_verified_user" ON COMMIT DROP AS
  SELECT
      "vu"."email",
      "vu"."id",
      "vu"."updatedAt",
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
      ) AS "position"
  FROM "ngc"."VerifiedUser" "vu"
  WHERE "vu"."id" IN (
      SELECT "id"
        FROM "ngc"."VerifiedUser"
       GROUP BY "id"
      HAVING COUNT(*) > 1
  )`,
  /* sql */ `
  -- The surviving row of each id.
  CREATE TEMPORARY TABLE "kept_verified_user" ON COMMIT DROP AS
  SELECT "id", "email"
    FROM "duplicate_verified_user"
   WHERE "position" = 1`,
  /* sql */ `
  -- The extra rows that carry an organisation administrator, in the order they
  -- would survive: at most one of them can take the surviving email, the others
  -- keep their own.
  CREATE TEMPORARY TABLE "administered_verified_user" ON COMMIT DROP AS
  SELECT
      "d"."email",
      "d"."id",
      ROW_NUMBER() OVER (PARTITION BY "d"."id" ORDER BY "d"."position") AS "administratorPosition"
  FROM "duplicate_verified_user" "d"
  WHERE "d"."position" > 1
    AND EXISTS (
        SELECT 1
          FROM "ngc"."OrganisationAdministrator" "oa"
         WHERE "oa"."userEmail" = "d"."email"
    )`,
  /* sql */ `
  -- The extra rows that cannot move to the surviving email because it already
  -- carries an organisation administrator, or because a nearer extra row took
  -- that slot.
  CREATE TEMPORARY TABLE "reassigned_verified_user" ON COMMIT DROP AS
  SELECT
      "a"."email",
      "a"."id" AS "oldId",
      gen_random_uuid() AS "newId"
  FROM "administered_verified_user" "a"
  JOIN "kept_verified_user" "k" ON "k"."id" = "a"."id"
  WHERE NOT (
      "a"."administratorPosition" = 1
      AND NOT EXISTS (
          SELECT 1
            FROM "ngc"."OrganisationAdministrator" "oa"
           WHERE "oa"."userEmail" = "k"."email"
      )
  )`,
  /* sql */ `
  -- The fresh identity needs its "User" row first: "VerifiedUser"."id" is a
  -- foreign key to it. The row mirrors the account it is split from, activity
  -- clock included, so the retention sweep keeps seeing the same dates.
  INSERT INTO "ngc"."User" ("id", "email", "name", "lastActivityAt", "createdAt", "updatedAt")
  SELECT
      "r"."newId",
      "vu"."email",
      "u"."name",
      "u"."lastActivityAt",
      "u"."createdAt",
      "u"."updatedAt"
  FROM "reassigned_verified_user" "r"
  JOIN "ngc"."VerifiedUser" "vu" ON "vu"."email" = "r"."email"
  JOIN "ngc"."User" "u" ON "u"."id" = "r"."oldId"`,
  /* sql */ `
  UPDATE "ngc"."VerifiedUser" "vu"
     SET "id" = "r"."newId"
    FROM "reassigned_verified_user" "r"
   WHERE "vu"."email" = "r"."email"`,
  /* sql */ `
  -- The organisation administrator of an extra row moves to the surviving email
  -- of its account, which frees the extra row to be deleted.
  UPDATE "ngc"."OrganisationAdministrator" "oa"
     SET "userEmail" = "k"."email"
    FROM "administered_verified_user" "a"
    JOIN "kept_verified_user" "k" ON "k"."id" = "a"."id"
   WHERE "oa"."userEmail" = "a"."email"
     AND "a"."administratorPosition" = 1
     AND NOT EXISTS (
         SELECT 1
           FROM "ngc"."OrganisationAdministrator" "existing"
          WHERE "existing"."userEmail" = "k"."email"
     )`,
  /* sql */ `
  -- Every extra row that did not keep its email goes, along with the email it
  -- held. The organisation administrator rows that pointed at it have moved
  -- above.
  DELETE FROM "ngc"."VerifiedUser" "vu"
  USING "duplicate_verified_user" "d"
  WHERE "vu"."email" = "d"."email"
    AND "d"."position" > 1
    AND NOT EXISTS (
        SELECT 1
          FROM "reassigned_verified_user" "r"
         WHERE "r"."email" = "d"."email"
    )`,
  /* sql */ `
  -- "User"."email" mirrors the verified record: it now names the surviving one.
  UPDATE "ngc"."User" "u"
     SET "email" = "k"."email"
    FROM "kept_verified_user" "k"
   WHERE "u"."id" = "k"."id"
     AND "u"."email" <> "k"."email"`,
]

const fetchPlan = (client: DeduplicationClient) =>
  client.$queryRawUnsafe<PlannedRow[]>(PLAN_SQL)

const fetchChecks = async (
  client: DeduplicationClient
): Promise<DeduplicationChecks> => {
  const [duplicates] = await client.$queryRawUnsafe<
    { duplicateIds: number; extraRows: number }[]
  >(/* sql */ `
    SELECT
      COUNT(*)::int AS "duplicateIds",
      COALESCE(SUM("rows" - 1), 0)::int AS "extraRows"
    FROM (
      SELECT COUNT(*)::int AS "rows"
      FROM "ngc"."VerifiedUser"
      GROUP BY "id"
      HAVING COUNT(*) > 1
    ) duplicates
  `)

  const [orphans] = await client.$queryRawUnsafe<
    { orphanOrganisationAdministrators: number }[]
  >(/* sql */ `
    SELECT COUNT(*)::int AS "orphanOrganisationAdministrators"
    FROM "ngc"."OrganisationAdministrator" "oa"
    WHERE NOT EXISTS (
      SELECT 1
      FROM "ngc"."VerifiedUser" "vu"
      WHERE "vu"."email" = "oa"."userEmail"
    )
  `)

  const [several] = await client.$queryRawUnsafe<
    { accountsWithSeveralOrganisationAdministrators: number }[]
  >(/* sql */ `
    SELECT COUNT(*)::int AS "accountsWithSeveralOrganisationAdministrators"
    FROM (
      SELECT "vu"."id"
      FROM "ngc"."OrganisationAdministrator" "oa"
      JOIN "ngc"."VerifiedUser" "vu" ON "vu"."email" = "oa"."userEmail"
      GROUP BY "vu"."id"
      HAVING COUNT(*) > 1
    ) accounts
  `)

  return {
    duplicateIds: duplicates?.duplicateIds ?? 0,
    extraRows: duplicates?.extraRows ?? 0,
    orphanOrganisationAdministrators:
      orphans?.orphanOrganisationAdministrators ?? 0,
    accountsWithSeveralOrganisationAdministrators:
      several?.accountsWithSeveralOrganisationAdministrators ?? 0,
  }
}

export const deduplicateVerifiedUsers = async ({
  dry = true,
  client = prisma,
}: {
  dry?: boolean
  client?: DeduplicationClient
} = {}): Promise<DeduplicationChecks> => {
  logger.info(
    dry
      ? 'Dry mode enabled: read-only mode'
      : 'Dry mode disabled: writing to the DB'
  )

  const plan = await fetchPlan(client)

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

  if (!dry) {
    await client.$transaction(
      async (tx) => {
        for (const statement of STATEMENTS) {
          await tx.$executeRawUnsafe(statement)
        }
      },
      { timeout: TRANSACTION_TIMEOUT }
    )

    logger.info('Deduplication applied', { rows: plan.length })
  }

  const checks = await fetchChecks(client)
  const failed = Object.values(checks).some((count) => count > 0)

  if (failed) {
    logger.error('Deduplication checks failed', checks)
  } else {
    logger.info('Deduplication checks passed', checks)
  }

  return checks
}

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`

if (isMain) {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      dry: { type: 'boolean' },
      d: { type: 'boolean' },
    },
    allowNegative: true,
  })

  const dry = values.dry ?? values.d ?? true

  deduplicateVerifiedUsers({ dry })
    .then((checks) => {
      const failed = Object.values(checks).some((count) => count > 0)
      process.exit(!dry && failed ? 1 : 0)
    })
    .catch((error) => {
      logger.error('Deduplication failed', errorMeta(error))
      process.exit(1)
    })
}
