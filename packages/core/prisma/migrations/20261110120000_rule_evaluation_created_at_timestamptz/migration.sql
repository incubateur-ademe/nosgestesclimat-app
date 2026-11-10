-- AlterTable
ALTER TABLE "ngc"."RuleEvaluation" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
