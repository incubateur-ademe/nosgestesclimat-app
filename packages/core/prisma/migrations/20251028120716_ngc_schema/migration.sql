-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ngc";

-- CreateEnum
CREATE TYPE "ngc"."ApiScopeName" AS ENUM ('ngc', 'agir', 'two_tons');

-- CreateEnum
CREATE TYPE "ngc"."JobStatus" AS ENUM ('pending', 'running', 'success', 'failure');

-- CreateEnum
CREATE TYPE "ngc"."MatomoStatsSource" AS ENUM ('beta', 'data');

-- CreateEnum
CREATE TYPE "ngc"."MatomoStatsDevice" AS ENUM ('desktop', 'all');

-- CreateEnum
CREATE TYPE "ngc"."NorthstarRatingType" AS ENUM ('learned', 'actions');

-- CreateEnum
CREATE TYPE "ngc"."OrganisationType" AS ENUM ('association', 'company', 'cooperative', 'groupOfFriends', 'other', 'publicOrRegionalAuthority', 'universityOrSchool');

-- CreateEnum
CREATE TYPE "ngc"."PollDefaultAdditionalQuestionType" AS ENUM ('postalCode', 'birthdate');

-- CreateEnum
CREATE TYPE "ngc"."QuizzAnswerIsAnswerCorrect" AS ENUM ('correct', 'almost', 'wrong');

-- CreateEnum
CREATE TYPE "ngc"."SimulationAdditionalQuestionAnswerType" AS ENUM ('custom', 'default');

-- CreateEnum
CREATE TYPE "ngc"."StatsKind" AS ENUM ('campaign', 'direct', 'search', 'social', 'website', 'aiAgent', 'all');

-- CreateEnum
CREATE TYPE "ngc"."VerificationCodeMode" AS ENUM ('signIn', 'signUp');

-- emails
CREATE DOMAIN "ngc"."EMAIL" AS TEXT
  CHECK ( VALUE ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' );

-- model
CREATE DOMAIN "ngc"."MODEL" AS TEXT
  CHECK ( VALUE ~ '^[A-Z]+-[a-z]+-\d+\.\d+\.\d+$' );

-- CreateTable
CREATE TABLE "ngc"."Answer" (
    "id" UUID NOT NULL,
    "survey" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "progress" REAL NOT NULL,
    "byCategory" JSONB NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."BrevoNewsletterStats" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "newsletter" INTEGER NOT NULL,
    "subscriptions" INTEGER NOT NULL,

    CONSTRAINT "BrevoNewsletterStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."BudgetStats" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "kind" "ngc"."StatsKind" NOT NULL,
    "referrer" TEXT NOT NULL DEFAULT 'all',
    "totalBudget" INTEGER NOT NULL,
    "acquisitionBudget" INTEGER NOT NULL,

    CONSTRAINT "BudgetStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."EmailSimulation" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."GroupAdministrator" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupAdministrator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."GroupParticipant" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "simulationId" UUID NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."IntegrationApiScope" (
    "name" "ngc"."ApiScopeName" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationApiScope_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "ngc"."IntegrationWhitelist" (
    "id" UUID NOT NULL,
    "emailPattern" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "apiScopeName" "ngc"."ApiScopeName" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationWhitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."Job" (
    "id" VARCHAR(64) NOT NULL,
    "status" "ngc"."JobStatus" NOT NULL,
    "params" JSONB NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."JobExecution" (
    "id" UUID NOT NULL,
    "jobId" VARCHAR(64) NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "JobExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."MatomoStats" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "source" "ngc"."MatomoStatsSource" NOT NULL,
    "kind" "ngc"."StatsKind" NOT NULL,
    "referrer" TEXT NOT NULL DEFAULT 'all',
    "device" "ngc"."MatomoStatsDevice" NOT NULL,
    "iframe" BOOLEAN NOT NULL,
    "visits" INTEGER NOT NULL,
    "firstAnswer" INTEGER NOT NULL,
    "finishedSimulations" INTEGER NOT NULL,

    CONSTRAINT "MatomoStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."NorthstarRating" (
    "id" TEXT NOT NULL,
    "simulationId" UUID NOT NULL,
    "type" "ngc"."NorthstarRatingType" NOT NULL,
    "value" SMALLINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NorthstarRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."Organisation" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(105) NOT NULL,
    "type" "ngc"."OrganisationType" NOT NULL DEFAULT 'other',
    "numberOfCollaborators" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."OrganisationAdministrator" (
    "id" TEXT NOT NULL,
    "userEmail" "ngc"."EMAIL" NOT NULL,
    "organisationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganisationAdministrator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."Poll" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(155) NOT NULL,
    "funFacts" JSONB,
    "computedResults" JSONB,
    "expectedNumberOfParticipants" INTEGER,
    "customAdditionalQuestions" JSONB NOT NULL,
    "organisationId" TEXT NOT NULL,
    "computeRealTimeStats" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."PollDefaultAdditionalQuestion" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "type" "ngc"."PollDefaultAdditionalQuestionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollDefaultAdditionalQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."QuizzAnswer" (
    "id" TEXT NOT NULL,
    "simulationId" UUID NOT NULL,
    "isAnswerCorrect" "ngc"."QuizzAnswerIsAnswerCorrect" NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizzAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."Simulation" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "progression" REAL NOT NULL,
    "model" "ngc"."MODEL" NOT NULL DEFAULT 'FR-fr-0.0.0',
    "savedViaEmail" BOOLEAN NOT NULL,
    "computedResults" JSONB NOT NULL,
    "actionChoices" JSONB NOT NULL,
    "situation" JSONB NOT NULL,
    "extendedSituation" JSONB,
    "foldedSteps" JSONB[],
    "userId" UUID NOT NULL,
    "userEmail" "ngc"."EMAIL",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."SimulationState" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "simulationId" UUID NOT NULL,
    "progression" REAL NOT NULL,

    CONSTRAINT "SimulationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."SimulationAdditionalQuestionAnswer" (
    "id" UUID NOT NULL,
    "type" "ngc"."SimulationAdditionalQuestionAnswerType" NOT NULL,
    "simulationId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationAdditionalQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."SimulationPoll" (
    "id" UUID NOT NULL,
    "pollId" TEXT NOT NULL,
    "simulationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationPoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."Survey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contextFile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."User" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" "ngc"."EMAIL",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."VerificationCode" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "email" "ngc"."EMAIL" NOT NULL,
    "mode" "ngc"."VerificationCodeMode",
    "code" VARCHAR(6) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."VerifiedUser" (
    "email" "ngc"."EMAIL" NOT NULL,
    "id" UUID NOT NULL,
    "name" TEXT,
    "telephone" TEXT,
    "position" TEXT,
    "optedInForCommunications" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerifiedUser_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "Answer_id_survey_key" ON "ngc"."Answer"("id", "survey");

-- CreateIndex
CREATE UNIQUE INDEX "BrevoNewsletterStats_date_newsletter_key" ON "ngc"."BrevoNewsletterStats"("date", "newsletter");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetStats_year_month_kind_referrer_key" ON "ngc"."BudgetStats"("year", "month", "kind", "referrer");

-- CreateIndex
CREATE UNIQUE INDEX "GroupAdministrator_groupId_key" ON "ngc"."GroupAdministrator"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupParticipant_groupId_userId_key" ON "ngc"."GroupParticipant"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationWhitelist_emailPattern_apiScopeName_key" ON "ngc"."IntegrationWhitelist"("emailPattern", "apiScopeName");

-- CreateIndex
CREATE UNIQUE INDEX "JobExecution_id_jobId_key" ON "ngc"."JobExecution"("id", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "MatomoStats_date_source_kind_referrer_device_iframe_key" ON "ngc"."MatomoStats"("date", "source", "kind", "referrer", "device", "iframe");

-- CreateIndex
CREATE UNIQUE INDEX "NorthstarRating_simulationId_key" ON "ngc"."NorthstarRating"("simulationId");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_slug_key" ON "ngc"."Organisation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationAdministrator_userEmail_key" ON "ngc"."OrganisationAdministrator"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Poll_slug_key" ON "ngc"."Poll"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PollDefaultAdditionalQuestion_pollId_type_key" ON "ngc"."PollDefaultAdditionalQuestion"("pollId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "QuizzAnswer_simulationId_answer_key" ON "ngc"."QuizzAnswer"("simulationId", "answer");

-- CreateIndex
CREATE INDEX "Simulation_userId_idx" ON "ngc"."Simulation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationState_date_simulationId_key" ON "ngc"."SimulationState"("date", "simulationId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationPoll_simulationId_pollId_key" ON "ngc"."SimulationPoll"("simulationId", "pollId");

-- CreateIndex
CREATE UNIQUE INDEX "Survey_name_key" ON "ngc"."Survey"("name");

ALTER TABLE "ngc"."BudgetStats" ADD CONSTRAINT "check_valid_month" CHECK ("month" BETWEEN 1 AND 12);

-- AddForeignKey
ALTER TABLE "ngc"."GroupAdministrator" ADD CONSTRAINT "GroupAdministrator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ngc"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."GroupAdministrator" ADD CONSTRAINT "GroupAdministrator_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ngc"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."GroupParticipant" ADD CONSTRAINT "GroupParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ngc"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."GroupParticipant" ADD CONSTRAINT "GroupParticipant_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ngc"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."GroupParticipant" ADD CONSTRAINT "GroupParticipant_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "ngc"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."IntegrationWhitelist" ADD CONSTRAINT "IntegrationWhitelist_apiScopeName_fkey" FOREIGN KEY ("apiScopeName") REFERENCES "ngc"."IntegrationApiScope"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."JobExecution" ADD CONSTRAINT "JobExecution_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ngc"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."OrganisationAdministrator" ADD CONSTRAINT "OrganisationAdministrator_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "ngc"."VerifiedUser"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."OrganisationAdministrator" ADD CONSTRAINT "OrganisationAdministrator_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "ngc"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."Poll" ADD CONSTRAINT "Poll_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "ngc"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."PollDefaultAdditionalQuestion" ADD CONSTRAINT "PollDefaultAdditionalQuestion_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "ngc"."Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."Simulation" ADD CONSTRAINT "Simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ngc"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."Simulation" ADD CONSTRAINT "Simulation_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "ngc"."VerifiedUser"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."SimulationState" ADD CONSTRAINT "SimulationState_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "ngc"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."SimulationAdditionalQuestionAnswer" ADD CONSTRAINT "SimulationAdditionalQuestionAnswer_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "ngc"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."SimulationPoll" ADD CONSTRAINT "SimulationPoll_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "ngc"."Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."SimulationPoll" ADD CONSTRAINT "SimulationPoll_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "ngc"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE VIEW ngc."ComputedResultsView" AS
SELECT id,
    date,
    "progression",
    "createdAt",
    "updatedAt",
    cast ("computedResults"->'carbone'->>'bilan' as float) as bilanCarbone,
    cast ("computedResults"->'carbone'->'categories'->>'transport' as float) as transportCarbone,
    cast ("computedResults"->'carbone'->'categories'->>'alimentation' as float) as alimentationCarbone,
    cast ("computedResults"->'carbone'->'categories'->>'logement' as float) as logementCarbone,
    cast ("computedResults"->'carbone'->'categories'->>'divers' as float) as diversCarbone,
    cast ("computedResults"->'eau'->>'bilan' as float) / 365 as bilanEauJour,
    cast ("computedResults"->'eau'->'categories'->>'transport' as float) / 365 as transportEauJour,
    cast ("computedResults"->'eau'->'categories'->>'alimentation' as float) / 365 as alimentationEauJour,
    cast ("computedResults"->'eau'->'categories'->>'logement' as float) / 365 as logementEauJour,
    cast ("computedResults"->'eau'->'categories'->>'divers' as float) / 365 as diversEauJour
FROM ngc."Simulation";
