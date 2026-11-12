CREATE UNIQUE INDEX "VerifiedUser_email_key" ON "ngc"."VerifiedUser"("email");

-- The administrations follow their user. The join mirrors the existing foreign
-- key's semantics, so it covers exactly the rows the constraint already allows.
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

-- Then the email-shaped link goes: dropping the column takes its index and its
-- foreign key with it, dropped explicitly to name the parts that disappear.
ALTER TABLE "ngc"."OrganisationAdministrator" DROP CONSTRAINT "OrganisationAdministrator_userEmail_fkey";
DROP INDEX "ngc"."OrganisationAdministrator_userEmail_key";
ALTER TABLE "ngc"."OrganisationAdministrator" DROP COLUMN "userEmail";

-- The primary key swap.
ALTER TABLE "ngc"."VerifiedUser" DROP CONSTRAINT "VerifiedUser_pkey";
ALTER TABLE "ngc"."VerifiedUser" ADD CONSTRAINT "VerifiedUser_pkey" PRIMARY KEY ("id");

-- The administrator's user id is unique, as the email was: one administration
-- per account. The foreign key is created after the swap because it needs the
-- referenced side to be unique.
CREATE UNIQUE INDEX "OrganisationAdministrator_userId_key" ON "ngc"."OrganisationAdministrator"("userId");

ALTER TABLE "ngc"."OrganisationAdministrator" ADD CONSTRAINT "OrganisationAdministrator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ngc"."VerifiedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
