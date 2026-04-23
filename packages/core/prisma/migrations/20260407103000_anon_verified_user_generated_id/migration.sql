-- RedefineView
DROP VIEW IF EXISTS "ngc_anon"."VerifiedUser";

CREATE VIEW "ngc_anon"."VerifiedUser" AS
SELECT
    -- We artificially set the email as id for anon views.
    md5(lower("email")) AS "id",
    "id" AS "user_id",
    "name",
    "telephone",
    "position",
    "optedInForCommunications",
    "createdAt",
    "updatedAt"
FROM "ngc"."VerifiedUser";
