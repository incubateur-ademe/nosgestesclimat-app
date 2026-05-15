-- CreateTable
CREATE TABLE "ngc"."Action" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "ruleId" UUID NOT NULL,
    "themeId" UUID NOT NULL,
    "media" JSONB,
    "tips" TEXT,
    "financialIncentives" TEXT,
    "furtherExplore" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."SeoMetadata" (
    "id" UUID NOT NULL,
    "actionId" UUID NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "jsonLd" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Action_deletedAt_publishedAt_idx" ON "ngc"."Action"("deletedAt", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Action_slug_key" ON "ngc"."Action"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_actionId_key" ON "ngc"."SeoMetadata"("actionId");

-- AddForeignKey
ALTER TABLE "ngc"."SeoMetadata" ADD CONSTRAINT "SeoMetadata_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ngc"."Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;
