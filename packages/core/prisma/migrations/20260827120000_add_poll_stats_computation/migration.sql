-- DropView
DROP VIEW "ngc_anon"."Poll";

-- AlterTable
ALTER TABLE "ngc"."Poll" DROP COLUMN "computeRealTimeStats";

-- CreateView
CREATE VIEW "ngc_anon"."Poll" AS
SELECT
    "id",
    "name",
    "slug",
    "funFacts",
    "computedResults",
    "expectedNumberOfParticipants",
    "customAdditionalQuestions",
    "organisationId",
    "createdAt",
    "updatedAt",
    "pollMode"
FROM "ngc"."Poll";

-- CreateTable
CREATE TABLE "ngc"."PollStatsComputation" (
    "pollId" TEXT NOT NULL,
    "status" "ngc"."ComputationStatus" NOT NULL DEFAULT 'pending',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollStatsComputation_pkey" PRIMARY KEY ("pollId")
);

-- CreateIndex
CREATE INDEX "PollStatsComputation_status_scheduledAt_idx" ON "ngc"."PollStatsComputation"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "SimulationPoll_pollId_createdAt_idx" ON "ngc"."SimulationPoll"("pollId", "createdAt");

-- AddForeignKey
ALTER TABLE "ngc"."PollStatsComputation" ADD CONSTRAINT "PollStatsComputation_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "ngc"."Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
