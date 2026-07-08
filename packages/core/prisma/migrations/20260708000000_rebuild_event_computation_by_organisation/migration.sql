-- Rebuild materialized view to group by organisation instead of poll
DROP MATERIALIZED VIEW IF EXISTS "ngc"."event_computation";
DROP INDEX IF EXISTS "ngc"."event_computation_eventId_idx";

CREATE MATERIALIZED VIEW "ngc"."event_computation" AS
SELECT
    e.id AS "eventId",
    p."organisationId" AS "organisationId",
    COUNT(sp.id)::INTEGER AS "simulationsCount"
FROM "ngc"."Event" e
LEFT JOIN "ngc"."Poll" p ON p."createdAt" >= e."startDate" AND p."createdAt" <= e."endDate"
LEFT JOIN "ngc"."SimulationPoll" sp ON sp."pollId" = p.id
GROUP BY e.id, p."organisationId";

CREATE INDEX IF NOT EXISTS "event_computation_eventId_idx" ON "ngc"."event_computation" ("eventId");
