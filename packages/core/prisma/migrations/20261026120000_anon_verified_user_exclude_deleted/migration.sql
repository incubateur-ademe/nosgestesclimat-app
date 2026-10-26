-- A soft-deleted user (ngc."User"."deletedAt" set) must disappear from the
-- pseudonymized view. An incremental warehouse sync never propagates deletes,
-- so the PostHog source is switched to a full table refresh instead.
--
-- Requires the "deletedAt" column added by 20261021151509_add_user_deleted_at.
--
-- PostHog warehouse consumers: ngc_anon."VerifiedUser" is refreshed in full,
-- weekly on Sunday at 23:59 (a full refresh is expensive, ~100k rows).
-- Row-level history is no longer retained after this switch.
--
-- Production: enable only after verifying on preprod that a deleted test
-- account's md5(lower(email)) disappears from the warehouse.

CREATE OR REPLACE VIEW "ngc_anon"."VerifiedUser" AS
SELECT
    -- We artificially set the email as id for anon views.
    md5(lower(v."email")) AS "id",
    v."id" AS "user_id",
    v."position",
    v."optedInForCommunications",
    v."createdAt",
    v."updatedAt"
FROM "ngc"."VerifiedUser" AS v
INNER JOIN "ngc"."User" AS u ON u."id" = v."id"
WHERE u."deletedAt" IS NULL;

COMMENT ON VIEW "ngc_anon"."VerifiedUser" IS
  'Pseudonymized verified users. Excludes users whose ngc."User"."deletedAt" is set. PostHog warehouse: full table refresh weekly (Sunday 23:59), no row-level history.';
