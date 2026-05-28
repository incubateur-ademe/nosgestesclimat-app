/*
  Warnings:

  - A unique constraint covering the columns `[simulationId,actionId]` on the table `ActionAssessment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ngc"."ComputationStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "ngc"."SimulationComputation" (
    "simulationId" UUID NOT NULL,
    "status" "ngc"."ComputationStatus" NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationComputation_pkey" PRIMARY KEY ("simulationId")
);

-- CreateIndex
CREATE INDEX "SimulationComputation_status_createdAt_idx" ON "ngc"."SimulationComputation"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ActionAssessment_simulationId_actionId_key" ON "ngc"."ActionAssessment"("simulationId", "actionId");

-- AddForeignKey
ALTER TABLE "ngc"."SimulationComputation" ADD CONSTRAINT "SimulationComputation_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "ngc"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
