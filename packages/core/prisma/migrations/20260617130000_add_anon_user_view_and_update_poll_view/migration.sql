-- CreateView
CREATE OR REPLACE VIEW "ngc_anon"."User" AS
SELECT
    "id",
    "name",
    "ageRange",
    "createdAt",
    "updatedAt"
FROM "ngc"."User";

-- RedefineView
CREATE OR REPLACE VIEW "ngc_anon"."Poll" AS
SELECT
    "id",
    "name",
    "slug",
    "funFacts",
    "computedResults",
    "expectedNumberOfParticipants",
    "customAdditionalQuestions",
    "computeRealTimeStats",
    "organisationId",
    "createdAt",
    "updatedAt",
    "pollMode"
FROM "ngc"."Poll";
