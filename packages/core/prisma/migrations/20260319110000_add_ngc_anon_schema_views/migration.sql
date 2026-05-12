-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ngc_anon";

-- CreateView
CREATE OR REPLACE VIEW "ngc_anon"."Simulation" AS
SELECT
    "id",
    "date",
    "progression",
    "model",
    "computedResults",
    "actionChoices",
    "situation",
    "foldedSteps",
    "userId",
    CASE
        WHEN "userEmail" IS NULL THEN NULL
        ELSE md5(lower("userEmail"))
    END AS "userEmail",
    "createdAt",
    "updatedAt"
FROM "ngc"."Simulation";

-- CreateView
CREATE OR REPLACE VIEW "ngc_anon"."VerifiedUser" AS
SELECT
    md5(lower("email")) AS "email",
    "id",
    "name",
    "telephone",
    "position",
    "optedInForCommunications",
    "createdAt",
    "updatedAt"
FROM "ngc"."VerifiedUser";

-- CreateView
CREATE OR REPLACE VIEW "ngc_anon"."Organisation" AS
SELECT
    "id",
    "name",
    "slug",
    "type",
    "numberOfCollaborators",
    "createdAt",
    "updatedAt"
FROM "ngc"."Organisation";

-- CreateView
CREATE OR REPLACE VIEW "ngc_anon"."OrganisationAdministrator" AS
SELECT
    "id",
    md5(lower("userEmail")) AS "userEmail",
    "organisationId",
    "createdAt",
    "updatedAt"
FROM "ngc"."OrganisationAdministrator";
