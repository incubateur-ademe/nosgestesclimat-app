-- Rebuild materialized view so that it counts simulations by simulation date
-- within the event window (not by poll creation date), so old/re-activated
-- campaigns are taken into account (Exemple 1 of the kanban card), and only
-- count completed simulations (progression = 1).

-- Add a slug column to Event so the /evenement/sedd URL can be resolved.
ALTER TABLE "ngc"."Event" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "Event_slug_key" ON "ngc"."Event"("slug");

-- Drop the previous materialized view.
DROP MATERIALIZED VIEW IF EXISTS "ngc"."event_computation";
DROP INDEX IF EXISTS "ngc"."event_computation_eventId_idx";

-- Total row (organisationId = NULL) + per-organisation rows.
-- Both are computed from this single materialized view (same refresh cadence),
-- as suggested in the kanban card ("on pourra ajouter la ligne des simulations
-- totales dans la materialized view de base, et juste mettre le pollId a null").
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

CREATE INDEX IF NOT EXISTS "event_computation_eventId_idx" ON "ngc"."event_computation" ("eventId");

-- Index Simulation.createdAt and Simulation.progression for the counter query.
CREATE INDEX IF NOT EXISTS "Simulation_createdAt_idx" ON "ngc"."Simulation"("createdAt");
CREATE INDEX IF NOT EXISTS "Simulation_progression_idx" ON "ngc"."Simulation"("progression");
