-- CreateView Group
CREATE OR REPLACE VIEW "ngc_anon"."Group" AS
SELECT
    "id",
    "createdAt",
    "updatedAt"
FROM "ngc"."Group";

-- CreateView GroupAdministrator
CREATE OR REPLACE VIEW "ngc_anon"."GroupAdministrator" AS
SELECT
    "id",
    "userId",
    "groupId",
    "createdAt",
    "updatedAt"
FROM "ngc"."GroupAdministrator";

-- CreateView GroupParticipant
CREATE OR REPLACE VIEW "ngc_anon"."GroupParticipant" AS
SELECT
    "id",
    "userId",
    "simulationId",
    "groupId",
    "createdAt",
    "updatedAt"
FROM "ngc"."GroupParticipant";
