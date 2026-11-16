import { prisma } from '@nosgestesclimat/core/prisma/client'
import { parseArgs } from 'node:util'
import logger, { errorMeta } from '../src/logger.ts'

/**
 * Removes the "VerifiedUser" rows that share the same "VerifiedUser"."id",
 * keeping one row per id: the repair to apply before "VerifiedUser"."id" can
 * become the primary key.
 *
 * Cause. The id used to be copied from the session when an email was verified.
 * Every verification made in the same session wrote its row with that session's
 * id, so an account now holds one row per email verified in that session. All
 * those rows share the id and, through it, the same simulations and tokens.
 *
 * Rule. One row survives per duplicated id. The surviving row is:
 *   1. the row whose email received the most recent login code;
 *   2. on a tie, the row with the most recent "VerifiedUser"."updatedAt";
 *   3. on a further tie, the alphabetically first email.
 *
 * Criteria 2 and 3 make the outcome independent of the order the rows are read
 * in.
 *
 * Every other "VerifiedUser" row of that id is a "redundant row": it loses
 * the arbitration, and the run either deletes it or keeps its email under a
 * fresh "VerifiedUser"."id". Four rows sharing one id give one surviving row
 * and three redundant rows.
 *
 * Administrators. An "administrator row" is a row of
 * "OrganisationAdministrator": its "userEmail" is unique and references
 * "VerifiedUser"."email", so no administrator row may keep pointing at a
 * deleted email.
 *
 * An administrator row is the only record of a right: the permission to
 * administer an organisation, which the authorisation reads back at each request
 * from the email of the session. The rows of one id form one account, since they
 * share the id and, through it, the same simulations and tokens, and the
 * arbitration keeps the email the person still logs in with. The right therefore
 * follows the account rather than the email that carried it: in the case when
 * the email of the surviving row is not the email the administrator row mentions
 * then the administrator row is updated to it, because the person still
 * administers the organisation and the reference to the deleted email would
 * otherwise break. The row is updated rather than deleted and written again, so
 * it keeps its "id", its "organisationId" and its "createdAt": the right stays
 * the one already held, at the seniority it already had, and a delete followed
 * by an insert would write a new row carrying the same organisation and a new
 * "createdAt".
 *   - in the case when the "userEmail" of an administrator row is the surviving
 *     email then no administrator row is updated, and the surviving row keeps
 *     its administrator row;
 *   - in the case when a redundant "VerifiedUser" row has its email linked to
 *     no administrator row then the redundant "VerifiedUser" row is deleted,
 *     and no foreign key is left pointing at its email;
 *   - in the case when a redundant "VerifiedUser" row has its email linked to
 *     an administrator row but the surviving email has no administrator row
 *     linked to it then that administrator row has its "userEmail" updated to
 *     the surviving email, and the redundant "VerifiedUser" row is then
 *     deleted;
 *   - in the case when a redundant "VerifiedUser" row has its email linked to
 *     an administrator row but that administrator row cannot have its
 *     "userEmail" updated to the surviving email, then the redundant
 *     "VerifiedUser" row keeps its email under a fresh "VerifiedUser"."id" and
 *     keeps its administrator row, so both administrator rows survive on two
 *     distinct accounts and the duplicated id is left with a single
 *     administration. The update fails in two cases, and both follow from
 *     "OrganisationAdministrator"."userEmail" being unique, so the surviving
 *     email carries at most one administrator row:
 *     - an administrator row already holds the surviving email in its
 *       "userEmail": the single administrator row the surviving email admits
 *       is taken, so a second administrator row cannot hold that email;
 *     - a redundant "VerifiedUser" row of the same id with a lower
 *       "survivalRank" holds an administrator row and updates it to the
 *       surviving email before this row reaches the update: the single
 *       administrator row the surviving email admits is taken first.
 *
 * Modes. Dry mode is the default: it reads the arbitration plan, reports it and
 * writes nothing. --no-dry applies the plan.
 *
 * Exit code. A dry run always exits with 0. An apply exits with 1 when at least
 * one anomaly remains: a "VerifiedUser"."id" shared by several rows, an
 * "OrganisationAdministrator" row whose "userEmail" matches no "VerifiedUser"
 * row, or a "VerifiedUser"."id" whose emails carry several
 * "OrganisationAdministrator" rows.
 */

type ArbitrationAction =
  /**
   * In the case when "survivalRank" = 1 then the row survives and its id keeps
   * its email.
   */
  | 'keep_email_under_current_id'
  /**
   * In the case when "survivalRank" > 1 but the email of the row is linked to
   * no administrator row then the row is deleted.
   */
  | 'delete_redundant_verified_user'
  /**
   * In the case when "survivalRank" > 1 and the email of the row is linked to
   * an administrator row but the surviving email has no administrator row
   * linked to it then that administrator row has its "userEmail" updated to the
   * surviving email, so the person keeps an administration the account still
   * holds, and the redundant "VerifiedUser" row is then deleted.
   */
  | 'move_organisation_administrator_to_surviving_email'
  /**
   * In the case when "survivalRank" > 1 and the email of the row is linked to
   * an administrator row but that administrator row cannot have its "userEmail"
   * updated to the surviving email, because an administrator row already holds
   * the surviving email in its "userEmail" or because a redundant
   * "VerifiedUser" row of the same id with a lower "survivalRank" updated its
   * administrator row to the surviving email first, then the row keeps its
   * email under a fresh "VerifiedUser"."id" and keeps its administrator row.
   */
  | 'keep_email_under_fresh_id'

interface ArbitrationPlanRow {
  /**
   * The value of "VerifiedUser"."id" that the duplicated rows hold: several
   * "VerifiedUser" rows of one account share it.
   */
  duplicateVerifiedUserId: string
  /** The value of "VerifiedUser"."email": the identity of the row. */
  verifiedUserEmail: string
  /** The value of "VerifiedUser"."updatedAt". */
  verifiedUserUpdatedAt: Date
  /**
   * The rank of the row inside its id: 1 marks the surviving row of the id, and
   * a rank above 1 marks a redundant "VerifiedUser" row.
   */
  survivalRank: number
  /**
   * In the case when the email of the row is linked to an administrator row
   * then the value is true, and it is false otherwise.
   */
  isOrganisationAdministrator: boolean
  /**
   * The most recent "VerificationCode"."updatedAt" among the login codes issued
   * to this email: a code is issued before it is used and an unused code still
   * counts, so this date is not the date of a connection.
   */
  lastLoginCodeIssuedAt: Date | null
  /** The outcome the arbitration plan applies to the row. */
  arbitrationAction: ArbitrationAction
}

interface RemainingAnomalies {
  /**
   * The number of "VerifiedUser"."id" values that several "VerifiedUser" rows
   * hold.
   */
  duplicatedVerifiedUserIds: number
  /**
   * The number of "VerifiedUser" rows beyond the surviving row of their id.
   */
  redundantVerifiedUserRows: number
  /**
   * The number of administrator rows whose "userEmail" is linked to no
   * "VerifiedUser" row.
   */
  orphanOrganisationAdministrators: number
  /**
   * The number of "VerifiedUser"."id" values whose emails are linked to several
   * administrator rows.
   */
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
 * The most recent login code issued to the email of the row being read: an
 * issued code counts even when it was never used, so this date is not the date
 * of a connection.
 */
const LAST_LOGIN_CODE_ISSUED_AT_SQL = /* sql */ `(
          SELECT MAX("login_code"."updatedAt")
          FROM "ngc"."VerificationCode" "login_code"
          WHERE "login_code"."email" = "verified_user_row"."email"
            AND "login_code"."usage" = 'login'
        )`

/**
 * The rank of a "VerifiedUser" row inside its id, the surviving row first: the
 * most recent login code issued to the email, then the most recent
 * "VerifiedUser"."updatedAt", then the alphabetically first email.
 */
const SURVIVAL_RANK_SQL = /* sql */ `ROW_NUMBER() OVER (
        PARTITION BY "verified_user_row"."id"
        ORDER BY ${LAST_LOGIN_CODE_ISSUED_AT_SQL} DESC NULLS LAST,
        "verified_user_row"."updatedAt" DESC,
        "verified_user_row"."email"
      )::int`

/**
 * The "VerifiedUser"."id" values that several "VerifiedUser" rows hold.
 */
const DUPLICATED_VERIFIED_USER_IDS_SQL = /* sql */ `
      SELECT "duplicated_account"."id"
      FROM "ngc"."VerifiedUser" "duplicated_account"
      GROUP BY "duplicated_account"."id"
      HAVING COUNT(*) > 1`

/**
 * The rank of the redundant "VerifiedUser" rows whose email is linked to an
 * administrator row, computed like the survival rank: the row of rank 1 is the
 * only redundant "VerifiedUser" row that can take the surviving email.
 */
const RANK_AMONG_ADMINISTRATOR_HOLDERS_SQL = /* sql */ `ROW_NUMBER() OVER (
        PARTITION BY "ranked_row"."id"
        ORDER BY "ranked_row"."survivalRank"
      )::int`

/**
 * The condition under which an administrator row can take the surviving email:
 * its redundant "VerifiedUser" row is the first holder of the id, and the
 * surviving email has no administrator row linked to it yet.
 *
 * The arbitration plan, the table of the rows kept under a fresh id and the
 * statement that moves the administrator row read this same text, so the plan
 * cannot announce a move the statements then refuse, or the reverse.
 */
const CAN_MOVE_ORGANISATION_ADMINISTRATOR_TO_SURVIVING_EMAIL_SQL = /* sql */ `"administrator_holder_row"."rankAmongAdministratorHolders" = 1
      AND NOT EXISTS (
        SELECT 1
        FROM "ngc"."OrganisationAdministrator" "administrator_of_surviving_email"
        WHERE "administrator_of_surviving_email"."userEmail" = "surviving_row"."email"
      )`

/**
 * The arbitration rule, as a read-only projection: the query returns one row
 * per "VerifiedUser" row whose "VerifiedUser"."id" is held by several rows
 *
 * The rank, the detection of the duplicated ids and the condition of the
 * action come from the SQL fragments the applied statements also read, so the
 * plan and the run cannot disagree on the rule.
 *
 * "arbitrationAction" comes from three facts:
 *   - "survivalRank": 1 marks the surviving row of the id;
 *   - "isOrganisationAdministrator": the email of the row is linked to an
 *     administrator row;
 *   - "rankAmongAdministratorHolders": the rank of the redundant "VerifiedUser"
 *     rows whose email is linked to an administrator row.
 *
 * In the case when the surviving email already has an administrator row linked
 * to it then no administrator row is updated: a redundant "VerifiedUser" row
 * whose email is linked to an administrator row keeps its email under a fresh
 * "VerifiedUser"."id", and a redundant "VerifiedUser" row whose email is linked
 * to no administrator row is deleted.
 */
const ARBITRATION_PLAN_SQL = /* sql */ `
  WITH ranked_verified_user_rows AS (
    SELECT
      "verified_user_row"."id" AS "id",
      "verified_user_row"."email" AS "email",
      "verified_user_row"."updatedAt" AS "updatedAt",
      ${LAST_LOGIN_CODE_ISSUED_AT_SQL} AS "lastLoginCodeIssuedAt",
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
    "ranked_row"."lastLoginCodeIssuedAt",
    "ranked_row"."updatedAt" AS "verifiedUserUpdatedAt",
    CASE
      WHEN "ranked_row"."survivalRank" = 1 THEN 'keep_email_under_current_id'
      -- In the case when a redundant "VerifiedUser" row has its email linked to
      -- no administrator row then the row is deleted and no foreign key is left
      -- pointing at its email, because "OrganisationAdministrator"."userEmail"
      -- is the only column that references "VerifiedUser"."email".
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

const CREATE_DUPLICATED_ROWS_RANKED_BY_SURVIVAL_ORDER_SQL = /* sql */ `
  -- Selects every row of every duplicated id with its "survivalRank" and stores
  -- the result in a temporary table.
  CREATE TEMPORARY TABLE "duplicated_verified_user_rows_ranked_by_survival_order" ON COMMIT DROP AS
  SELECT
      "verified_user_row"."email",
      "verified_user_row"."id",
      "verified_user_row"."updatedAt",
      ${SURVIVAL_RANK_SQL} AS "survivalRank"
  FROM "ngc"."VerifiedUser" "verified_user_row"
  WHERE "verified_user_row"."id" IN (${DUPLICATED_VERIFIED_USER_IDS_SQL}
  )`

const CREATE_SURVIVING_VERIFIED_USER_ROW_SQL = /* sql */ `
  -- Selects the row of "survivalRank" 1 of each id, the row that keeps the id,
  -- into a temporary table.
  CREATE TEMPORARY TABLE "surviving_verified_user_row" ON COMMIT DROP AS
  SELECT
      "ranked_row"."id",
      "ranked_row"."email"
    FROM "duplicated_verified_user_rows_ranked_by_survival_order" "ranked_row"
   WHERE "ranked_row"."survivalRank" = 1`

const CREATE_REDUNDANT_ROWS_HOLDING_AN_ADMINISTRATOR_SQL = /* sql */ `
  -- Selects the redundant "VerifiedUser" rows whose email is linked to an
  -- administrator row, ranks them by "survivalRank", and stores them in a
  -- temporary table: at most one of those rows per id can take the surviving
  -- email, and every other row keeps its own email.
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

const CREATE_REDUNDANT_ROWS_KEPT_UNDER_A_FRESH_ID_SQL = /* sql */ `
  -- Selects the redundant "VerifiedUser" rows whose administrator row cannot
  -- have its "userEmail" updated to the surviving email, either because an
  -- administrator row already holds the surviving email in its "userEmail" or
  -- because a redundant "VerifiedUser" row of the same id with a lower
  -- "survivalRank" updated its administrator row to the surviving email first,
  -- and gives each selected row a fresh "VerifiedUser"."id".
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

const INSERT_USER_ROW_FOR_REDUNDANT_ROWS_KEPT_UNDER_A_FRESH_ID_SQL = /* sql */ `
  -- In the case when a redundant "VerifiedUser" row keeps its email then its
  -- "User" row is written before its "VerifiedUser" row, because
  -- "VerifiedUser"."id" references "User"."id"; the new "User" row copies the
  -- name, "lastActivityAt" and the timestamps of the "User" row the email is
  -- split from, so the retention sweep keeps reading the same dates.
  INSERT INTO "ngc"."User" ("id", "email", "name", "lastActivityAt", "createdAt", "updatedAt")
  SELECT
      "fresh_id_row"."freshVerifiedUserId",
      "verified_user_row"."email",
      "account"."name",
      "account"."lastActivityAt",
      "account"."createdAt",
      "account"."updatedAt"
  FROM "redundant_verified_user_rows_kept_under_a_fresh_id" "fresh_id_row"
  JOIN "ngc"."VerifiedUser" "verified_user_row"
    ON "verified_user_row"."email" = "fresh_id_row"."email"
  JOIN "ngc"."User" "account"
    ON "account"."id" = "fresh_id_row"."redundantVerifiedUserId"`

const ASSIGN_FRESH_ID_TO_REDUNDANT_ROWS_KEPT_UNDER_A_FRESH_ID_SQL = /* sql */ `
  -- In the case when a redundant "VerifiedUser" row keeps its email then it
  -- takes the fresh "VerifiedUser"."id", so the email and the id no longer
  -- belong to the duplicated account.
  UPDATE "ngc"."VerifiedUser" "verified_user_row"
     SET "id" = "fresh_id_row"."freshVerifiedUserId"
    FROM "redundant_verified_user_rows_kept_under_a_fresh_id" "fresh_id_row"
   WHERE "verified_user_row"."email" = "fresh_id_row"."email"`

const MOVE_ORGANISATION_ADMINISTRATOR_TO_SURVIVING_EMAIL_SQL = /* sql */ `
  -- In the case when a redundant "VerifiedUser" row has its email linked to an
  -- administrator row, that administrator row has the lowest
  -- "rankAmongAdministratorHolders" of its id, and the surviving email has no
  -- administrator row linked to it then that administrator row has its
  -- "userEmail" updated to the surviving email, so the person keeps an
  -- administration the account still holds, which frees the redundant
  -- "VerifiedUser" row to be deleted.
  --
  -- The row is updated rather than deleted and written again: it is the only
  -- record of the right to administer its organisation, the authorisation reads
  -- that right back at each request from the email of the session, and the
  -- "VerifiedUser" rows of one id are one account, since they share the id and,
  -- through it, the same simulations and tokens. The right therefore belongs to
  -- the account and not to the email that carried it; the update moves it to the
  -- email the arbitration keeps, which is the email the person still logs in
  -- with, and the row keeps its "id", its "organisationId" and its
  -- "createdAt", which a delete followed by an insert would lose.
  UPDATE "ngc"."OrganisationAdministrator" "organisation_administrator"
     SET "userEmail" = "surviving_row"."email"
    FROM "redundant_verified_user_rows_holding_an_administrator" "administrator_holder_row"
    JOIN "surviving_verified_user_row" "surviving_row"
      ON "surviving_row"."id" = "administrator_holder_row"."id"
   WHERE "organisation_administrator"."userEmail" = "administrator_holder_row"."email"
     AND ${CAN_MOVE_ORGANISATION_ADMINISTRATOR_TO_SURVIVING_EMAIL_SQL}`

const DELETE_REDUNDANT_ROWS_THAT_DID_NOT_KEEP_THEIR_EMAIL_SQL = /* sql */ `
  -- In the case when a redundant "VerifiedUser" row did not keep its email then
  -- the statement deletes the row with the email it held; the administrator
  -- rows that had that email in "userEmail" have been updated by the previous
  -- statement.
  DELETE FROM "ngc"."VerifiedUser" "verified_user_row"
  USING "duplicated_verified_user_rows_ranked_by_survival_order" "ranked_row"
  WHERE "verified_user_row"."email" = "ranked_row"."email"
    AND "ranked_row"."survivalRank" > 1
    AND NOT EXISTS (
        SELECT 1
          FROM "redundant_verified_user_rows_kept_under_a_fresh_id" "fresh_id_row"
         WHERE "fresh_id_row"."email" = "ranked_row"."email"
    )`

const UPDATE_USER_EMAIL_TO_SURVIVING_EMAIL_SQL = /* sql */ `
  -- In the case when "User"."email" holds a value and that value is not the
  -- surviving email then "User"."email" is updated to the surviving email;
  -- "User"."email" is a deprecated mirror of "VerifiedUser"."email", and a
  -- "User"."email" that holds NULL stays NULL, because the comparison of the
  -- statement is never true against a NULL.
  UPDATE "ngc"."User" "account"
     SET "email" = "surviving_row"."email"
    FROM "surviving_verified_user_row" "surviving_row"
   WHERE "account"."id" = "surviving_row"."id"
     AND "account"."email" <> "surviving_row"."email"`

/**
 * The statements that apply the arbitration plan, run in this order inside one
 * transaction: each statement reads what the previous ones created, so the
 * order carries a meaning.
 *
 * The first four statements create four temporary tables:
 *   - duplicated_verified_user_rows_ranked_by_survival_order holds every row of
 *     every duplicated id with its "survivalRank";
 *   - surviving_verified_user_row holds the row of "survivalRank" 1 of each id;
 *   - redundant_verified_user_rows_holding_an_administrator holds the redundant
 *     "VerifiedUser" rows whose email is linked to an administrator row, with
 *     their "rankAmongAdministratorHolders";
 *   - redundant_verified_user_rows_kept_under_a_fresh_id holds the redundant
 *     "VerifiedUser" rows that keep their email under a fresh
 *     "VerifiedUser"."id", with their "freshVerifiedUserId".
 *
 * In the case when a redundant "VerifiedUser" row has its email linked to an
 * administrator row that can be updated then that administrator row has its
 * "userEmail" updated to the surviving email before the redundant
 * "VerifiedUser" row is deleted. In the case when a "User" row is created for a
 * fresh "VerifiedUser"."id" then that "User" row is written first, because
 * "VerifiedUser"."id" references "User"."id".
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

const COUNT_DUPLICATED_ACCOUNTS_SQL = /* sql */ `
  -- Counts the "VerifiedUser"."id" values that several "VerifiedUser" rows
  -- hold, and the number of "VerifiedUser" rows beyond the first of each id.
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

const COUNT_ORPHAN_ORGANISATION_ADMINISTRATORS_SQL = /* sql */ `
  -- Counts the administrator rows whose "userEmail" is linked to no
  -- "VerifiedUser" row.
  SELECT COUNT(*)::int AS "orphanOrganisationAdministrators"
  FROM "ngc"."OrganisationAdministrator" "organisation_administrator"
  WHERE NOT EXISTS (
    SELECT 1
    FROM "ngc"."VerifiedUser" "verified_user_row"
    WHERE "verified_user_row"."email" = "organisation_administrator"."userEmail"
  )
`

const COUNT_IDS_WITH_SEVERAL_ORGANISATION_ADMINISTRATORS_SQL = /* sql */ `
  -- Counts the "VerifiedUser"."id" values whose emails are linked to several
  -- administrator rows.
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
 * Reads the four counts a correct run leaves at zero: the counts are read after
 * the run, so they measure what the run produced rather than what the plan
 * announced.
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
 * Reads the arbitration plan, reports it, applies it when "dry" is false, and
 * counts the anomalies the run leaves: a count above 0 means the run failed and
 * the caller decides the exit code.
 *
 * In the case when "dry" is false then the plan is read inside the transaction
 * that applies it, from the transaction client: what the run logs is therefore
 * the plan of the transaction that writes, not a plan read before it opened.
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
        // The email is logged unchanged: the operator reads it to accept or
        // refuse the plan.
        duplicateVerifiedUserId: row.duplicateVerifiedUserId,
        verifiedUserEmail: row.verifiedUserEmail,
        survivalRank: row.survivalRank,
        isOrganisationAdministrator: row.isOrganisationAdministrator,
        lastLoginCodeIssuedAt: row.lastLoginCodeIssuedAt,
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

  if (hasRemainingAnomalies) {
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
 * Reads the mode from the command line: the command line accepts --dry and
 * --no-dry only, --dry being the default and -d its short alias.
 */
export const readDryFlag = (args: string[]): boolean => {
  const { values } = parseArgs({
    args,
    options: {
      dry: { type: 'boolean' },
      d: { type: 'boolean' },
    },
    allowNegative: true,
  })

  return values.dry ?? values.d ?? true
}

/**
 * The exit code of a run that reached its end: in the case when the run is dry
 * then the process exits with 0. In the case when the run applies the plan then
 * the process exits with 0 when no anomaly remains and with 1 otherwise.
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
 * In the case when the module is the process entry point then the run reads its
 * mode from the command line and the process exits with the code
 * "exitCodeOfRun" returns. In the case when the run fails then the process
 * exits with 1 in both modes.
 */
const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`

if (isMain) {
  const dry = readDryFlag(process.argv.slice(2))

  deduplicateVerifiedUsers({ dry })
    .then((remainingAnomalies) => {
      process.exit(exitCodeOfRun({ dry, remainingAnomalies }))
    })
    .catch((error) => {
      logger.error('VerifiedUser deduplication failed', errorMeta(error))
      process.exit(1)
    })
}
