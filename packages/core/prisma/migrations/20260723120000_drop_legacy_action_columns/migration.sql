-- Legacy flat columns on Action have been fully replaced by ActionTranslation
-- (see 20260716120000_add_action_translation, which already backfilled a
-- 'fr' row for every action). All reads/writes now go through ActionTranslation.

-- DropIndex
DROP INDEX "ngc"."Action_slug_key";

-- AlterTable
ALTER TABLE "ngc"."Action"
DROP COLUMN "financialIncentives",
DROP COLUMN "furtherExplore",
DROP COLUMN "longDescription",
DROP COLUMN "media",
DROP COLUMN "slug",
DROP COLUMN "tips",
DROP COLUMN "title";
