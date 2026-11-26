-- Declared as @@index([status]) in ngc.prisma: reads that select simulations by
-- lifecycle stage would otherwise sequentially scan a table that only grows.
--
-- CONCURRENTLY as in 20260918111000: the table is written on every autosave,
-- and a plain CREATE INDEX takes a SHARE lock that would block those writes for
-- the whole build.
CREATE INDEX CONCURRENTLY "Simulation_status_idx"
  ON "ngc"."Simulation" ("status");
