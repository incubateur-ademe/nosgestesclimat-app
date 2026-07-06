-- CreateTable
CREATE TABLE "ngc"."Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateMaterializedView
CREATE MATERIALIZED VIEW "ngc"."event_computation" AS
SELECT
    e.id AS "eventId",
    p.id AS "pollId",
    COUNT(sp.id)::INTEGER AS "nbSimulations"
FROM "ngc"."Event" e
LEFT JOIN "ngc"."Poll" p ON p."createdAt" >= e."startDate" AND p."createdAt" <= e."endDate"
LEFT JOIN "ngc"."SimulationPoll" sp ON sp."pollId" = p.id
GROUP BY e.id, p.id;

-- Add index on eventId for faster queries
CREATE INDEX IF NOT EXISTS "event_computation_eventId_idx" ON "ngc"."event_computation" ("eventId");
