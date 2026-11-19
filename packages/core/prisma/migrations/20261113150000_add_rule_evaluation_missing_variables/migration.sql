-- CreateTable
CREATE TABLE "ngc"."RuleEvaluationMissingVariable" (
    "simulationId" UUID NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "missingRuleId" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "RuleEvaluationMissingVariable_pkey" PRIMARY KEY ("simulationId","ruleId","missingRuleId")
);

-- AddForeignKey
ALTER TABLE "ngc"."RuleEvaluationMissingVariable" ADD CONSTRAINT "RuleEvaluationMissingVariable_simulationId_ruleId_fkey" FOREIGN KEY ("simulationId", "ruleId") REFERENCES "ngc"."RuleEvaluation"("simulationId", "ruleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngc"."RuleEvaluationMissingVariable" ADD CONSTRAINT "RuleEvaluationMissingVariable_simulationId_missingRuleId_fkey" FOREIGN KEY ("simulationId", "missingRuleId") REFERENCES "ngc"."RuleEvaluation"("simulationId", "ruleId") ON DELETE CASCADE ON UPDATE CASCADE;

