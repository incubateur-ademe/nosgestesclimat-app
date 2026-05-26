-- DropForeignKey
ALTER TABLE "ngc"."Simulation" DROP CONSTRAINT "Simulation_userId_fkey";

-- CreateTable
CREATE TABLE "ngc"."ActionAssessment" (
    "id" UUID NOT NULL,
    "impact" DOUBLE PRECISION,
    "applicable" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "simulationId" UUID NOT NULL,
    "actionId" UUID NOT NULL,

    CONSTRAINT "ActionAssessment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ngc"."ActionAssessment" ADD CONSTRAINT "ActionAssessment_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "ngc"."Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."ActionAssessment" ADD CONSTRAINT "ActionAssessment_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ngc"."Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."Simulation" ADD CONSTRAINT "Simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ngc"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
