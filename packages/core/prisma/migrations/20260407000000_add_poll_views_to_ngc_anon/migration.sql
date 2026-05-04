-- CreateView Poll
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
    "updatedAt"
FROM "ngc"."Poll";

-- CreateView SimulationPoll
CREATE OR REPLACE VIEW "ngc_anon"."SimulationPoll" AS
SELECT
    "id",
    "pollId",
    "simulationId",
    "createdAt",
    "updatedAt"
FROM "ngc"."SimulationPoll";
