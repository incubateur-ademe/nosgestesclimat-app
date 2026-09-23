-- ngc_anon."VerifiedUser" is exported to the PostHog warehouse, and name and
-- telephone were the only columns there that identify a person directly. The
-- hash on the email is what makes the view anonymous; contact details were
-- synced as they are.
--
-- PostgreSQL cannot remove columns with CREATE OR REPLACE VIEW, so the view is
-- recreated. The post-migrate script re-grants it to the anon readonly roles.
--
-- Prisma applies migration files without a transaction, so the swap is wrapped
-- by hand: a reader must find the view, before or after, never missing.
BEGIN;

DROP VIEW "ngc_anon"."VerifiedUser";

CREATE VIEW "ngc_anon"."VerifiedUser" AS
SELECT
    -- We artificially set the email as id for anon views.
    md5(lower("email")) AS "id",
    "id" AS "user_id",
    "position",
    "optedInForCommunications",
    "createdAt",
    "updatedAt"
FROM "ngc"."VerifiedUser";

COMMIT;
