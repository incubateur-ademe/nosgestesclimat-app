import { maskEmail } from '@nosgestesclimat/core/lib/pii'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { parseArgs } from 'node:util'
import logger, { errorMeta } from '../src/logger.ts'

/**
 * Removes the "VerifiedUser" rows that share the same "VerifiedUser"."id", the
 * repair to apply before "VerifiedUser"."id" can become the primary key.
 *
 * Cause. The id used to be copied from the session when an email was verified:
 * every verification made in one session wrote its row with that session's id,
 * so an account holds one row per email verified in that session, and the rows
 * share the id and, through it, the same simulations and tokens.
 *
 * Rule. One row survives per id: the row whose email holds the most recent
 * login code activity, then the row with the most recent
 * "VerifiedUser"."updatedAt", then the alphabetically first email. The last two
 * criteria make the outcome independent of the order the rows are read in.
 * Every other row of the id either loses its email or keeps it under a fresh
 * "VerifiedUser"."id", depending on the administrator row it may hold.
 *
 * When a redundant email has an organisationAdministrator linked to it
 * that organisationAdministrator is updated to the surviving email rather
 * because we assert that the original account that created the organisationAdministrator
 * should have been the survival one.
 * When the surviving email already holds an administrator row, the
 * update would break the uniqueness: the redundant email then keeps its
 * administrator row under a fresh "VerifiedUser"."id".
 */

type ArbitrationAction =
  /** The row survives and its id keeps its email. */
  | 'keep_email_under_current_id'
  /** The redundant row is deleted: no administrator row holds its email. */
  | 'delete_redundant_verified_user'
  /**
   * The administrator row of the redundant row is updated to the surviving
   * email, then the redundant row is deleted.
   */
  | 'move_organisation_administrator_to_surviving_email'
  /**
   * The administrator row of the redundant row cannot take the surviving
   * email, so the row keeps its email under a fresh "VerifiedUser"."id".
   */
  | 'keep_email_under_fresh_id'

interface ArbitrationPlanRow {
  /** The "VerifiedUser"."id" the rows of one account share. */
  duplicateVerifiedUserId: string
  /** The "VerifiedUser"."email" of the row. */
  verifiedUserEmail: string
  /** The "VerifiedUser"."updatedAt" of the row. */
  verifiedUserUpdatedAt: Date
  /** 1 marks the surviving row of the id, above 1 a redundant row. */
  survivalRank: number
  /** True when an administrator row holds the email of the row. */
  isOrganisationAdministrator: boolean
  /**
   * The most recent write to a login code row of the email: the issuance or the
   * claim of the code, so not necessarily the date of a connection.
   */
  lastLoginCodeActivityAt: Date | null
  /** The outcome the plan applies to the row. */
  arbitrationAction: ArbitrationAction
}

interface RemainingAnomalies {
  /** The number of "VerifiedUser"."id" values several rows hold. */
  duplicatedVerifiedUserIds: number
  /** The number of "VerifiedUser" rows beyond the surviving row of their id. */
  redundantVerifiedUserRows: number
  /** The number of administrator rows matching no "VerifiedUser" row. */
  orphanOrganisationAdministrators: number
  /** The number of ids whose emails carry several administrator rows. */
  verifiedUserIdsWithSeveralOrganisationAdministrators: number
}

/**
 * The subset of the Prisma client the script uses: declaring it lets the test
 * run the script against its own database.
 */
export interface VerifiedUserDeduplicationClient {
  $queryRawUnsafe<T = unknown>(query: string): Promise<T>
  $executeRawUnsafe(query: string): Promise<unknown>
  $transaction<T>(
    transaction: (
      transactionClient: Pick<
        VerifiedUserDeduplicationClient,
        '$queryRawUnsafe' | '$executeRawUnsafe'
      >
    ) => Promise<T>,
    options?: { timeout?: number }
  ): Promise<T>
}

/**
 * Every statement reads the whole "VerifiedUser" table: the run lasts longer
 * than the default transaction timeout.
 */
const DEDUPLICATION_TRANSACTION_TIMEOUT = 10 * 60 * 1000

/**
 * The most recent write to a login code row of the email: a claim rewrites the
 * expiration date, so the value covers the issuance and the claim alike.
 */
const LAST_LOGIN_CODE_ACTIVITY_AT_SQL = /* sql */ `(
          SELECT MAX("login_code"."updatedAt")
          FROM "ngc"."VerificationCode" "login_code"
          WHERE "login_code"."email" = "verified_user_row"."email"
            AND "login_code"."usage" = 'login'
        )`

/**
 * The rank of a "VerifiedUser" row inside its id, the surviving row first: the
 * most recent login code activity, then the most recent
 * "VerifiedUser"."updatedAt", then the alphabetically first email.
 */
const SURVIVAL_RANK_SQL = /* sql */ `ROW_NUMBER() OVER (
        PARTITION BY "verified_user_row"."id"
        ORDER BY ${LAST_LOGIN_CODE_ACTIVITY_AT_SQL} DESC NULLS LAST,
        "verified_user_row"."updatedAt" DESC,
        "verified_user_row"."email"
      )::int`

/** The "VerifiedUser"."id" values that several "VerifiedUser" rows hold. */
const DUPLICATED_VERIFIED_USER_IDS_SQL = /* sql */ `
      SELECT "duplicated_account"."id"
      FROM "ngc"."VerifiedUser" "duplicated_account"
      GROUP BY "duplicated_account"."id"
      HAVING COUNT(*) > 1`

/**
 * The rank of the redundant rows holding an administrator row: the first of
 * them is the only one that can take the surviving email.
 */
const RANK_AMONG_ADMINISTRATOR_HOLDERS_SQL = /* sql */ `ROW_NUMBER() OVER (
        PARTITION BY "ranked_row"."id"
        ORDER BY "ranked_row"."survivalRank"
      )::int`

/**
 * The condition under which an administrator row can take the surviving email:
 * its "VerifiedUser" row is the first holder of the id, and the surviving email
 * has no administrator row yet.
 *
 * The plan, the table of the rows kept under a fresh id and the statement that
 * moves the administrator row read this same text, so they cannot disagree.
 */
const CAN_MOVE_ORGANISATION_ADMINISTRATOR_TO_SURVIVING_EMAIL_SQL = /* sql */ `"administrator_holder_row"."rankAmongAdministratorHolders" = 1
      AND NOT EXISTS (
        SELECT 1
        FROM "ngc"."OrganisationAdministrator" "administrator_of_surviving_email"
        WHERE "administrator_of_surviving_email"."userEmail" = "surviving_row"."email"
      )`

/**
 * The arbitration rule, as a read-only projection: one row per "VerifiedUser"
 * row whose "VerifiedUser"."id" is held by several rows.
 *
 * "arbitrationAction" comes from "survivalRank", from
 * "isOrganisationAdministrator" and from "rankAmongAdministratorHolders".
 */
const ARBITRATION_PLAN_SQL = /* sql */ `
  WITH ranked_verified_user_rows AS (
    SELECT
      "verified_user_row"."id" AS "id",
      "verified_user_row"."email" AS "email",
      "verified_user_row"."updatedAt" AS "updatedAt",
      ${LAST_LOGIN_CODE_ACTIVITY_AT_SQL} AS "lastLoginCodeActivityAt",
      EXISTS (
        SELECT 1
        FROM "ngc"."OrganisationAdministrator" "organisation_administrator"
        WHERE "organisation_administrator"."userEmail" = "verified_user_row"."email"
      ) AS "isOrganisationAdministrator",
      ${SURVIVAL_RANK_SQL} AS "survivalRank"
    FROM "ngc"."VerifiedUser" "verified_user_row"
    WHERE "verified_user_row"."id" IN (${DUPLICATED_VERIFIED_USER_IDS_SQL}
    )
  ),
  redundant_verified_user_rows_holding_an_administrator AS (
    SELECT
      "ranked_row"."id",
      "ranked_row"."email",
      ${RANK_AMONG_ADMINISTRATOR_HOLDERS_SQL} AS "rankAmongAdministratorHolders"
    FROM "ranked_verified_user_rows" "ranked_row"
    WHERE "ranked_row"."survivalRank" > 1
      AND "ranked_row"."isOrganisationAdministrator"
  )
  SELECT
    "ranked_row"."id" AS "duplicateVerifiedUserId",
    "ranked_row"."email" AS "verifiedUserEmail",
    "ranked_row"."survivalRank",
    "ranked_row"."isOrganisationAdministrator",
    "ranked_row"."lastLoginCodeActivityAt",
    "ranked_row"."updatedAt" AS "verifiedUserUpdatedAt",
    CASE
      WHEN "ranked_row"."survivalRank" = 1 THEN 'keep_email_under_current_id'
      -- "OrganisationAdministrator"."userEmail" is the only column that
      -- references "VerifiedUser"."email": a redundant row without an
      -- administrator row leaves no dangling reference behind it.
      WHEN NOT "ranked_row"."isOrganisationAdministrator"
        THEN 'delete_redundant_verified_user'
      WHEN ${CAN_MOVE_ORGANISATION_ADMINISTRATOR_TO_SURVIVING_EMAIL_SQL}
        THEN 'move_organisation_administrator_to_surviving_email'
      ELSE 'keep_email_under_fresh_id'
    END AS "arbitrationAction"
  FROM "ranked_verified_user_rows" "ranked_row"
  LEFT JOIN "redundant_verified_user_rows_holding_an_administrator" "administrator_holder_row"
    ON "administrator_holder_row"."id" = "ranked_row"."id"
    AND "administrator_holder_row"."email" = "ranked_row"."email"
  LEFT JOIN "ranked_verified_user_rows" "surviving_row"
    ON "surviving_row"."id" = "ranked_row"."id"
    AND "surviving_row"."survivalRank" = 1
  ORDER BY "ranked_row"."id", "ranked_row"."survivalRank"
`

/** Every row of every duplicated id, with its "survivalRank". */
const CREATE_DUPLICATED_ROWS_RANKED_BY_SURVIVAL_ORDER_SQL = /* sql */ `
  CREATE TEMPORARY TABLE "duplicated_verified_user_rows_ranked_by_survival_order" ON COMMIT DROP AS
  SELECT
      "verified_user_row"."email",
      "verified_user_row"."id",
      "verified_user_row"."updatedAt",
      ${SURVIVAL_RANK_SQL} AS "survivalRank"
  FROM "ngc"."VerifiedUser" "verified_user_row"
  WHERE "verified_user_row"."id" IN (${DUPLICATED_VERIFIED_USER_IDS_SQL}
  )`

/** The row of "survivalRank" 1 of each duplicated id. */
const CREATE_SURVIVING_VERIFIED_USER_ROW_SQL = /* sql */ `
  CREATE TEMPORARY TABLE "surviving_verified_user_row" ON COMMIT DROP AS
  SELECT
      "ranked_row"."id",
      "ranked_row"."email"
    FROM "duplicated_verified_user_rows_ranked_by_survival_order" "ranked_row"
   WHERE "ranked_row"."survivalRank" = 1`

/** The redundant rows holding an administrator row, ranked by "survivalRank". */
const CREATE_REDUNDANT_ROWS_HOLDING_AN_ADMINISTRATOR_SQL = /* sql */ `
  CREATE TEMPORARY TABLE "redundant_verified_user_rows_holding_an_administrator" ON COMMIT DROP AS
  SELECT
      "ranked_row"."email",
      "ranked_row"."id",
      ${RANK_AMONG_ADMINISTRATOR_HOLDERS_SQL} AS "rankAmongAdministratorHolders"
  FROM "duplicated_verified_user_rows_ranked_by_survival_order" "ranked_row"
  WHERE "ranked_row"."survivalRank" > 1
    AND EXISTS (
        SELECT 1
          FROM "ngc"."OrganisationAdministrator" "organisation_administrator"
         WHERE "organisation_administrator"."userEmail" = "ranked_row"."email"
    )`

/** The redundant rows that keep their email, with their fresh "VerifiedUser"."id". */
const CREATE_REDUNDANT_ROWS_KEPT_UNDER_A_FRESH_ID_SQL = /* sql */ `
  CREATE TEMPORARY TABLE "redundant_verified_user_rows_kept_under_a_fresh_id" ON COMMIT DROP AS
  SELECT
      "administrator_holder_row"."email",
      "administrator_holder_row"."id" AS "redundantVerifiedUserId",
      gen_random_uuid() AS "freshVerifiedUserId"
  FROM "redundant_verified_user_rows_holding_an_administrator" "administrator_holder_row"
  JOIN "surviving_verified_user_row" "surviving_row"
    ON "surviving_row"."id" = "administrator_holder_row"."id"
  WHERE NOT (${CAN_MOVE_ORGANISATION_ADMINISTRATOR_TO_SURVIVING_EMAIL_SQL}
  )`

/**
 * The "User" row of a redundant row kept under a fresh id, written before the
 * "VerifiedUser" row because "VerifiedUser"."id" references "User"."id". Every
 * column is copied from the "User" row the email is split from, so the retention
 * sweep keeps reading the same dates.
 */
const INSERT_USER_ROW_FOR_REDUNDANT_ROWS_KEPT_UNDER_A_FRESH_ID_SQL = /* sql */ `
  INSERT INTO "ngc"."User" ("id", "email", "name", "lastActivityAt", "deletedAt", "retentionNoticeSentAt", "finalNoticeSentAt", "createdAt", "updatedAt")
  SELECT
      "fresh_id_row"."freshVerifiedUserId",
      "verified_user_row"."email",
      "account"."name",
      "account"."lastActivityAt",
      "account"."deletedAt",
      "account"."retentionNoticeSentAt",
      "account"."finalNoticeSentAt",
      "account"."createdAt",
      "account"."updatedAt"
  FROM "redundant_verified_user_rows_kept_under_a_fresh_id" "fresh_id_row"
  JOIN "ngc"."VerifiedUser" "verified_user_row"
    ON "verified_user_row"."email" = "fresh_id_row"."email"
  JOIN "ngc"."User" "account"
    ON "account"."id" = "fresh_id_row"."redundantVerifiedUserId"`

/** Gives the kept emails the fresh id of their new account. */
const ASSIGN_FRESH_ID_TO_REDUNDANT_ROWS_KEPT_UNDER_A_FRESH_ID_SQL = /* sql */ `
  UPDATE "ngc"."VerifiedUser" "verified_user_row"
     SET "id" = "fresh_id_row"."freshVerifiedUserId"
    FROM "redundant_verified_user_rows_kept_under_a_fresh_id" "fresh_id_row"
   WHERE "verified_user_row"."email" = "fresh_id_row"."email"`

/**
 * Moves the administrator row to the surviving email. The row is updated rather
 * than deleted and written again, so it keeps its "id", its "organisationId"
 * and its "createdAt": a delete followed by an insert would lose them.
 */
const MOVE_ORGANISATION_ADMINISTRATOR_TO_SURVIVING_EMAIL_SQL = /* sql */ `
  UPDATE "ngc"."OrganisationAdministrator" "organisation_administrator"
     SET "userEmail" = "surviving_row"."email"
    FROM "redundant_verified_user_rows_holding_an_administrator" "administrator_holder_row"
    JOIN "surviving_verified_user_row" "surviving_row"
      ON "surviving_row"."id" = "administrator_holder_row"."id"
   WHERE "organisation_administrator"."userEmail" = "administrator_holder_row"."email"
     AND ${CAN_MOVE_ORGANISATION_ADMINISTRATOR_TO_SURVIVING_EMAIL_SQL}`

/**
 * Deletes the redundant rows that did not keep their email: the administrator
 * rows that held those emails have been moved by the previous statement, and
 * the foreign key would otherwise refuse the deletion.
 */
const DELETE_REDUNDANT_ROWS_THAT_DID_NOT_KEEP_THEIR_EMAIL_SQL = /* sql */ `
  DELETE FROM "ngc"."VerifiedUser" "verified_user_row"
  USING "duplicated_verified_user_rows_ranked_by_survival_order" "ranked_row"
  WHERE "verified_user_row"."email" = "ranked_row"."email"
    AND "ranked_row"."survivalRank" > 1
    AND NOT EXISTS (
        SELECT 1
          FROM "redundant_verified_user_rows_kept_under_a_fresh_id" "fresh_id_row"
         WHERE "fresh_id_row"."email" = "ranked_row"."email"
    )`

/**
 * Mirrors the surviving email into "User"."email", a deprecated column; a
 * "User"."email" that holds NULL stays NULL, since the comparison is never true
 * against a NULL.
 */
const UPDATE_USER_EMAIL_TO_SURVIVING_EMAIL_SQL = /* sql */ `
  UPDATE "ngc"."User" "account"
     SET "email" = "surviving_row"."email"
    FROM "surviving_verified_user_row" "surviving_row"
   WHERE "account"."id" = "surviving_row"."id"
     AND "account"."email" <> "surviving_row"."email"`

/**
 * The statements that apply the plan, in this order and in one transaction:
 * each one reads what the previous ones created.
 */
const DEDUPLICATION_STATEMENTS = [
  CREATE_DUPLICATED_ROWS_RANKED_BY_SURVIVAL_ORDER_SQL,
  CREATE_SURVIVING_VERIFIED_USER_ROW_SQL,
  CREATE_REDUNDANT_ROWS_HOLDING_AN_ADMINISTRATOR_SQL,
  CREATE_REDUNDANT_ROWS_KEPT_UNDER_A_FRESH_ID_SQL,
  INSERT_USER_ROW_FOR_REDUNDANT_ROWS_KEPT_UNDER_A_FRESH_ID_SQL,
  ASSIGN_FRESH_ID_TO_REDUNDANT_ROWS_KEPT_UNDER_A_FRESH_ID_SQL,
  MOVE_ORGANISATION_ADMINISTRATOR_TO_SURVIVING_EMAIL_SQL,
  DELETE_REDUNDANT_ROWS_THAT_DID_NOT_KEEP_THEIR_EMAIL_SQL,
  UPDATE_USER_EMAIL_TO_SURVIVING_EMAIL_SQL,
]

/** Reads the arbitration plan: the query applies the rule and writes nothing. */
const readArbitrationPlan = (
  client: Pick<VerifiedUserDeduplicationClient, '$queryRawUnsafe'>
) => client.$queryRawUnsafe<ArbitrationPlanRow[]>(ARBITRATION_PLAN_SQL)

/**
 * Counts the duplicated ids and the rows beyond the first of each id.
 */
const COUNT_DUPLICATED_ACCOUNTS_SQL = /* sql */ `
  SELECT
    COUNT(*)::int AS "duplicatedVerifiedUserIds",
    COALESCE(SUM("rows" - 1), 0)::int AS "redundantVerifiedUserRows"
  FROM (
    SELECT COUNT(*)::int AS "rows"
    FROM "ngc"."VerifiedUser" "verified_user_row"
    GROUP BY "verified_user_row"."id"
    HAVING COUNT(*) > 1
  ) duplicated_account
`

/** Counts the administrator rows whose "userEmail" matches no "VerifiedUser" row. */
const COUNT_ORPHAN_ORGANISATION_ADMINISTRATORS_SQL = /* sql */ `
  SELECT COUNT(*)::int AS "orphanOrganisationAdministrators"
  FROM "ngc"."OrganisationAdministrator" "organisation_administrator"
  WHERE NOT EXISTS (
    SELECT 1
    FROM "ngc"."VerifiedUser" "verified_user_row"
    WHERE "verified_user_row"."email" = "organisation_administrator"."userEmail"
  )
`

/** Counts the ids whose emails carry several administrator rows. */
const COUNT_IDS_WITH_SEVERAL_ORGANISATION_ADMINISTRATORS_SQL = /* sql */ `
  SELECT COUNT(*)::int AS "verifiedUserIdsWithSeveralOrganisationAdministrators"
  FROM (
    SELECT "verified_user_row"."id"
    FROM "ngc"."OrganisationAdministrator" "organisation_administrator"
    JOIN "ngc"."VerifiedUser" "verified_user_row"
      ON "verified_user_row"."email" = "organisation_administrator"."userEmail"
    GROUP BY "verified_user_row"."id"
    HAVING COUNT(*) > 1
  ) accounts_with_several_organisation_administrators
`

/**
 * Reads the four counts a correct run leaves at zero, after the run: they
 * measure what the run produced, not what the plan announced.
 */
const readRemainingAnomalies = async (
  client: VerifiedUserDeduplicationClient
): Promise<RemainingAnomalies> => {
  const [duplicatedAccountCounts] = await client.$queryRawUnsafe<
    { duplicatedVerifiedUserIds: number; redundantVerifiedUserRows: number }[]
  >(COUNT_DUPLICATED_ACCOUNTS_SQL)

  const [orphanAdministratorCounts] = await client.$queryRawUnsafe<
    { orphanOrganisationAdministrators: number }[]
  >(COUNT_ORPHAN_ORGANISATION_ADMINISTRATORS_SQL)

  const [countsOfIdsWithSeveralAdministrators] = await client.$queryRawUnsafe<
    { verifiedUserIdsWithSeveralOrganisationAdministrators: number }[]
  >(COUNT_IDS_WITH_SEVERAL_ORGANISATION_ADMINISTRATORS_SQL)

  return {
    duplicatedVerifiedUserIds:
      duplicatedAccountCounts?.duplicatedVerifiedUserIds ?? 0,
    redundantVerifiedUserRows:
      duplicatedAccountCounts?.redundantVerifiedUserRows ?? 0,
    orphanOrganisationAdministrators:
      orphanAdministratorCounts?.orphanOrganisationAdministrators ?? 0,
    verifiedUserIdsWithSeveralOrganisationAdministrators:
      countsOfIdsWithSeveralAdministrators?.verifiedUserIdsWithSeveralOrganisationAdministrators ??
      0,
  }
}

/**
 * Reads the plan, reports it, applies it when "dry" is false, and counts the
 * anomalies the run leaves.
 *
 * In apply mode the plan is read inside the transaction that applies it, from
 * the transaction client: what the run logs is the plan of the transaction that
 * writes.
 */
export const deduplicateVerifiedUsers = async ({
  dry = true,
  client = prisma,
}: {
  dry?: boolean
  client?: VerifiedUserDeduplicationClient
} = {}): Promise<RemainingAnomalies> => {
  logger.info(
    dry
      ? 'Dry mode: reading the arbitration plan, writing nothing'
      : 'Apply mode: writing to the database'
  )

  const logArbitrationPlan = (arbitrationPlan: ArbitrationPlanRow[]) => {
    logger.info('VerifiedUser deduplication plan', {
      rows: arbitrationPlan.length,
      rowsByArbitrationAction: arbitrationPlan.reduce<Record<string, number>>(
        (countsByArbitrationAction, row) => {
          countsByArbitrationAction[row.arbitrationAction] =
            (countsByArbitrationAction[row.arbitrationAction] ?? 0) + 1
          return countsByArbitrationAction
        },
        {}
      ),
    })

    for (const row of arbitrationPlan) {
      logger.info('VerifiedUser deduplication plan row', {
        duplicateVerifiedUserId: row.duplicateVerifiedUserId,
        // No PII in the logs: the operator reads the plan through the database.
        verifiedUserEmail: maskEmail(row.verifiedUserEmail),
        survivalRank: row.survivalRank,
        isOrganisationAdministrator: row.isOrganisationAdministrator,
        lastLoginCodeActivityAt: row.lastLoginCodeActivityAt,
        verifiedUserUpdatedAt: row.verifiedUserUpdatedAt,
        arbitrationAction: row.arbitrationAction,
      })
    }
  }

  let arbitrationPlan: ArbitrationPlanRow[]

  if (dry) {
    arbitrationPlan = await readArbitrationPlan(client)
    logArbitrationPlan(arbitrationPlan)
  } else {
    arbitrationPlan = await client.$transaction(
      async (transactionClient) => {
        const transactionPlan = await readArbitrationPlan(transactionClient)
        logArbitrationPlan(transactionPlan)

        for (const statement of DEDUPLICATION_STATEMENTS) {
          await transactionClient.$executeRawUnsafe(statement)
        }

        return transactionPlan
      },
      { timeout: DEDUPLICATION_TRANSACTION_TIMEOUT }
    )
  }

  if (!dry) {
    logger.info('VerifiedUser deduplication applied', {
      rows: arbitrationPlan.length,
    })
  }

  const remainingAnomalies = await readRemainingAnomalies(client)
  const hasRemainingAnomalies = Object.values(remainingAnomalies).some(
    (count) => count > 0
  )

  if (dry) {
    logger.info(
      hasRemainingAnomalies
        ? 'VerifiedUser deduplication found anomalies, nothing written'
        : 'VerifiedUser deduplication found no anomaly, nothing written',
      remainingAnomalies
    )
  } else if (hasRemainingAnomalies) {
    logger.error(
      'VerifiedUser deduplication left anomalies',
      remainingAnomalies
    )
  } else {
    logger.info(
      'VerifiedUser deduplication left no anomaly',
      remainingAnomalies
    )
  }

  return remainingAnomalies
}

/**
 * Reads the mode from the command line: --dry (or -d) is the default and
 * --no-dry (or --no-d) applies the plan. Passing both is an error: the last one
 * would silently win.
 */
export const readDryFlag = (args: string[]): boolean => {
  const { values, tokens } = parseArgs({
    args,
    options: {
      dry: { type: 'boolean' },
      d: { type: 'boolean' },
    },
    allowNegative: true,
    tokens: true,
  })

  const dryTokens = tokens.filter(
    (token) =>
      token.kind === 'option' && (token.name === 'dry' || token.name === 'd')
  )

  if (dryTokens.length > 1) {
    throw new Error('Pass either --dry or --no-dry, not both')
  }

  return values.dry ?? values.d ?? true
}

/**
 * The exit code of a run that reached its end: a dry run exits with 0, an apply
 * exits with 0 when no anomaly remains and with 1 otherwise.
 */
export const exitCodeOfRun = ({
  dry,
  remainingAnomalies,
}: {
  dry: boolean
  remainingAnomalies: RemainingAnomalies
}): number =>
  !dry && Object.values(remainingAnomalies).some((count) => count > 0) ? 1 : 0

/**
 * The process entry point: the run reads its mode from the command line, sets
 * the exit code the run returns, and lets the process end on its own so the
 * logs are flushed. A failed run exits with 1 in both modes.
 */
const run = async () => {
  try {
    const dry = readDryFlag(process.argv.slice(2))

    process.exitCode = exitCodeOfRun({
      dry,
      remainingAnomalies: await deduplicateVerifiedUsers({ dry }),
    })
  } catch (error) {
    logger.error('VerifiedUser deduplication failed', errorMeta(error))
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`

if (isMain) {
  void run()
}
