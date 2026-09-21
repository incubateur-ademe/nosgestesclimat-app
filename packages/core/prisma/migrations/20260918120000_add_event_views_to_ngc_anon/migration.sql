-- Podium data for PostHog: event window and per-organisation counts, read from
-- the anon schema so the warehouse role does not need access to ngc.
CREATE OR REPLACE VIEW "ngc_anon"."Event" AS
SELECT
    "id",
    "slug",
    "name",
    "startDate",
    "endDate",
    "createdAt",
    "updatedAt"
FROM "ngc"."Event";

-- Reads the materialized view, so it is as fresh as the last refresh.
CREATE OR REPLACE VIEW "ngc_anon"."event_computation" AS
SELECT
    "eventId",
    "organisationId",
    "simulationsCount"
FROM "ngc"."event_computation";
