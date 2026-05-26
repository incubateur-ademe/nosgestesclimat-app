CREATE TYPE "ngc"."ComputationStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE "ngc"."SimulationComputation" (
  "simulationId" UUID NOT NULL,
  "status" "ngc"."ComputationStatus" NOT NULL DEFAULT 'pending',
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "error" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "SimulationComputation_pkey" PRIMARY KEY ("simulationId"),
  CONSTRAINT "SimulationComputation_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "ngc"."Simulation"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

ALTER TABLE "ngc"."ActionAssessment" ADD CONSTRAINT "ActionAssessment_simulationId_actionId_key" UNIQUE ("simulationId", "actionId");
