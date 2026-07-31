-- CreateTable
CREATE TABLE "ngc"."ActionTranslation" (
    "id" UUID NOT NULL,
    "actionId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "media" JSONB,
    "tips" TEXT,
    "financialIncentives" TEXT,
    "furtherExplore" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActionTranslation_actionId_locale_key" ON "ngc"."ActionTranslation"("actionId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ActionTranslation_locale_slug_key" ON "ngc"."ActionTranslation"("locale", "slug");

-- AddForeignKey
ALTER TABLE "ngc"."ActionTranslation" ADD CONSTRAINT "ActionTranslation_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ngc"."Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: every pre-existing Action gets a 'fr' ActionTranslation row from its
-- current flat columns, so locale-aware reads (which query ActionTranslation
-- exclusively, including for 'fr') don't regress before the next Notion sync run.
INSERT INTO "ngc"."ActionTranslation" (
    "id", "actionId", "locale", "title", "slug", "longDescription", "media", "tips",
    "financialIncentives", "furtherExplore",
    "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid(), a."id", 'fr', a."title", a."slug", a."longDescription", a."media", a."tips",
    a."financialIncentives", a."furtherExplore",
    now(), now()
FROM "ngc"."Action" a;

-- Re-point SeoMetadata from Action (one row per action) to ActionTranslation
-- (one row per locale): reassign each existing row to that action's newly
-- backfilled 'fr' translation, keeping the exact same content - no duplication.
ALTER TABLE "ngc"."SeoMetadata" ADD COLUMN "actionTranslationId" UUID;

UPDATE "ngc"."SeoMetadata" sm
SET "actionTranslationId" = at."id"
FROM "ngc"."ActionTranslation" at
WHERE at."actionId" = sm."actionId" AND at."locale" = 'fr';

ALTER TABLE "ngc"."SeoMetadata" DROP CONSTRAINT "SeoMetadata_actionId_fkey";
DROP INDEX "ngc"."SeoMetadata_actionId_key";
ALTER TABLE "ngc"."SeoMetadata" DROP COLUMN "actionId";
ALTER TABLE "ngc"."SeoMetadata" ALTER COLUMN "actionTranslationId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_actionTranslationId_key" ON "ngc"."SeoMetadata"("actionTranslationId");

-- AddForeignKey
ALTER TABLE "ngc"."SeoMetadata" ADD CONSTRAINT "SeoMetadata_actionTranslationId_fkey" FOREIGN KEY ("actionTranslationId") REFERENCES "ngc"."ActionTranslation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
