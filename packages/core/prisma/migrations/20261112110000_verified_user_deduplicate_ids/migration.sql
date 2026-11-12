-- The next migration makes "VerifiedUser"."id" the primary key, so every id
-- must name a single row. The id used to be copied from the session, and a
-- sign-up holding a verified session reused that session's id: an account can
-- therefore carry one row per email it was verified with, all sharing the id
-- and, through it, the same simulations and tokens.
--
-- One row survives per duplicated id: the email with the most recent login
-- code, then the most recently updated row, then the email alphabetically. The
-- last two break ties so that the outcome does not depend on the order rows
-- are read in - the surviving email is the one the person logs in with.
--
-- The organisation administrators follow the surviving email: an
-- "OrganisationAdministrator" row is unique per email, and the next migration
-- makes it unique per "userId" too, so one cannot be left pointing at a deleted
-- email. Where two emails of the same id both administer an organisation, the
-- extra row keeps its email and is handed a fresh id, along with the "User" row
-- that id needs: the two organisation administrators belong to two distinct
-- accounts from now on.
--
-- Prisma runs a migration file outside a transaction: the writes are wrapped by
-- hand, so that a failure leaves the table as it was. Every statement is a
-- plain DML, and the whole file is a no-op when no id is duplicated.
BEGIN;

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
);

-- The surviving row of each id.
CREATE TEMPORARY TABLE "kept_verified_user" ON COMMIT DROP AS
SELECT "id", "email"
  FROM "duplicate_verified_user"
 WHERE "position" = 1;

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
  );

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
);

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
JOIN "ngc"."User" "u" ON "u"."id" = "r"."oldId";

UPDATE "ngc"."VerifiedUser" "vu"
   SET "id" = "r"."newId"
  FROM "reassigned_verified_user" "r"
 WHERE "vu"."email" = "r"."email";

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
   );

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
  );

-- "User"."email" mirrors the verified record: it now names the surviving one.
UPDATE "ngc"."User" "u"
   SET "email" = "k"."email"
  FROM "kept_verified_user" "k"
 WHERE "u"."id" = "k"."id"
   AND "u"."email" <> "k"."email";

COMMIT;
