-- CreateTable
CREATE TABLE "ngc"."Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMPTZ(3) NOT NULL,
    "endDate" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "ngc"."Event"("slug");

-- Backfill the slug for the seeded SEDD 2026 event (idempotent).
UPDATE "ngc"."Event" SET "slug" = 'sedd' WHERE "name" = 'SEDD 2026' AND "slug" IS NULL;

-- CreateMaterializedView
-- Counts simulations by simulation date within the event window (not by poll
-- creation date), so old/re-activated campaigns are taken into account, and
-- only counts completed simulations (progression = 1). The total row
-- (organisationId = NULL) and the per-organisation rows come from this single
-- materialized view, as suggested in the kanban card.
CREATE MATERIALIZED VIEW "ngc"."event_computation" AS
-- Total: all completed simulations in the event window (collective tests,
-- home, iframes, etc.). COUNT(s.id) so an event without simulations yields 0.
SELECT
    e.id AS "eventId",
    NULL::TEXT AS "organisationId",
    COUNT(s.id)::INTEGER AS "simulationsCount"
FROM "ngc"."Event" e
LEFT JOIN "ngc"."Simulation" s ON s."createdAt" >= e."startDate" AND s."createdAt" <= e."endDate" AND s."progression" = 1
GROUP BY e.id

UNION ALL

-- Per-organisation: completed simulations via collective tests in the event
-- window, whatever the age of the poll (old campaigns are taken into account).
SELECT
    e.id AS "eventId",
    p."organisationId" AS "organisationId",
    COUNT(DISTINCT s.id)::INTEGER AS "simulationsCount"
FROM "ngc"."Event" e
LEFT JOIN "ngc"."Simulation" s ON s."createdAt" >= e."startDate" AND s."createdAt" <= e."endDate" AND s."progression" = 1
LEFT JOIN "ngc"."SimulationPoll" sp ON sp."simulationId" = s.id
LEFT JOIN "ngc"."Poll" p ON p.id = sp."pollId"
WHERE p."organisationId" IS NOT NULL
GROUP BY e.id, p."organisationId";

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY:
-- each (eventId, organisationId) pair is unique (total row has organisationId NULL).
CREATE UNIQUE INDEX "event_computation_eventId_organisationId_key"
  ON "ngc"."event_computation" ("eventId", "organisationId");

-- Index Simulation.createdAt and Simulation.progression for the counter query.
CREATE INDEX IF NOT EXISTS "Simulation_createdAt_idx" ON "ngc"."Simulation"("createdAt");
CREATE INDEX IF NOT EXISTS "Simulation_progression_idx" ON "ngc"."Simulation"("progression");
