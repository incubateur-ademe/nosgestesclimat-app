-- CreateIndex if not exists
CREATE INDEX IF NOT EXISTS "Simulation_userEmail_idx" ON "ngc"."Simulation"("userEmail") WHERE "userEmail" IS NOT NULL;
