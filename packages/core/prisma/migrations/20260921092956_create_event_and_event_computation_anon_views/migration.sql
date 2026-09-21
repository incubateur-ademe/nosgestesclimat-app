-- Create AnonEvent and AnonEventComputation views
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

CREATE OR REPLACE VIEW "ngc_anon"."EventComputation" AS
SELECT
    "eventId",
    "organisationId",
    "simulationsCount"
FROM "ngc"."event_computation";
