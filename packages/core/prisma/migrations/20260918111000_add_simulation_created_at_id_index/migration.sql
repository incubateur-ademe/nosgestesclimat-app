-- Index scanned by the event_computation materialized view refresh: without it
-- the refresh reads every completed simulation ever stored to keep the ones
-- created inside the event window. CONCURRENTLY because a plain CREATE INDEX
-- takes a SHARE lock that would block the autosaves for the whole build.
CREATE INDEX CONCURRENTLY "Simulation_createdAt_id_idx"
  ON "ngc"."Simulation" ("createdAt", "id")
  WHERE "progression" = 1;
