-- CreateEnum
CREATE TYPE "ngc"."Metric" AS ENUM ('carbon', 'water');

-- CreateTable
CREATE TABLE "ngc"."Rule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "metric" "ngc"."Metric" NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngc"."RuleEvaluation" (
    "simulationId" UUID NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "applicable" BOOLEAN,
    "valueNumber" DOUBLE PRECISION,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleEvaluation_pkey" PRIMARY KEY ("simulationId","ruleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rule_name_metric_key" ON "ngc"."Rule"("name", "metric");

-- CreateIndex
CREATE INDEX "RuleEvaluation_ruleId_createdAt_idx" ON "ngc"."RuleEvaluation"("ruleId", "createdAt");

-- AddForeignKey
ALTER TABLE "ngc"."RuleEvaluation" ADD CONSTRAINT "RuleEvaluation_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "ngc"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."RuleEvaluation" ADD CONSTRAINT "RuleEvaluation_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ngc"."Rule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
