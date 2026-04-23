-- Make userId nullable in Simulation table
ALTER TABLE "ngc"."Simulation" ALTER COLUMN "userId" DROP NOT NULL;
