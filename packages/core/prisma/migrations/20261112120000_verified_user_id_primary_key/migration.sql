CREATE UNIQUE INDEX "VerifiedUser_email_key" ON "ngc"."VerifiedUser"("email");

-- The primary key swap goes first: on duplicate "id" it is the only statement
-- that can fail on rows already there, and here it fails while "userEmail",
-- its links and the old key are still in place. Further down they are dropped,
-- so a failure there would leave the table in a state the running application
-- cannot read. The two sub-commands share one statement: PostgreSQL applies an
-- ALTER TABLE atomically, so a rejected swap leaves the email key as it was.
-- The foreign key is removed before because it depends on the index of the old
-- key.
ALTER TABLE "ngc"."OrganisationAdministrator" DROP CONSTRAINT "OrganisationAdministrator_userEmail_fkey";

ALTER TABLE "ngc"."VerifiedUser"
    DROP CONSTRAINT "VerifiedUser_pkey",
    ADD CONSTRAINT "VerifiedUser_pkey" PRIMARY KEY ("id");

-- The administrations follow their user. The join mirrors the semantics of the
-- foreign key just dropped, so it covers exactly the rows it allowed.
ALTER TABLE "ngc"."OrganisationAdministrator" ADD COLUMN "userId" UUID;

UPDATE "ngc"."OrganisationAdministrator" oa
   SET "userId" = vu."id"
  FROM "ngc"."VerifiedUser" vu
 WHERE vu."email" = oa."userEmail";

ALTER TABLE "ngc"."OrganisationAdministrator" ALTER COLUMN "userId" SET NOT NULL;

-- The analytics views are exported to the PostHog warehouse: neither may carry
-- an email or anything derived from one. PostgreSQL cannot remove or rename a
-- column with CREATE OR REPLACE VIEW, so both are recreated. They go before the
-- column they read is dropped, and Prisma applies migration files without a
-- transaction, so the swap is wrapped by hand: a reader finds each view before
-- or after, never missing. The post-migrate script re-grants them to the anon
-- readonly roles.
BEGIN;

DROP VIEW "ngc_anon"."VerifiedUser";

CREATE VIEW "ngc_anon"."VerifiedUser" AS
SELECT
    "id" AS "userId",
    "position",
    "optedInForCommunications",
    "createdAt",
    "updatedAt"
FROM "ngc"."VerifiedUser";

DROP VIEW "ngc_anon"."OrganisationAdministrator";

CREATE VIEW "ngc_anon"."OrganisationAdministrator" AS
SELECT
    "id",
    "userId",
    "organisationId",
    "createdAt",
    "updatedAt"
FROM "ngc"."OrganisationAdministrator";

COMMIT;

-- Then the email-shaped link goes: dropping the column takes its index with
-- it, dropped explicitly to name the part that disappears.
DROP INDEX "ngc"."OrganisationAdministrator_userEmail_key";
ALTER TABLE "ngc"."OrganisationAdministrator" DROP COLUMN "userEmail";

-- The administrator's user id is unique, as the email was: one administration
-- per account. The foreign key comes last: it needs the referenced side to be
-- unique and every row backfilled.
CREATE UNIQUE INDEX "OrganisationAdministrator_userId_key" ON "ngc"."OrganisationAdministrator"("userId");

ALTER TABLE "ngc"."OrganisationAdministrator" ADD CONSTRAINT "OrganisationAdministrator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ngc"."VerifiedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
