-- Simulation is rewritten about eight times per row (the simulator autosaves at
-- almost every step): 12.7 M updates for 1.5 M rows, half of them non-HOT. With
-- the default autovacuum_vacuum_scale_factor of 0.2 the threshold sits around
-- 310 k dead tuples, so autovacuum fires roughly once a day and clears them in a
-- single long pass. In between, the visibility map stays stale — and it is the
-- map that lets the event_computation refresh read Simulation_createdAt_id_idx
-- without fetching the heap for every non-visible tuple.
--
-- A lower scale factor trades that one pass for several small ones, which keeps
-- the map fresh, and the raised cost limit keeps each pass short enough not to
-- compete with the site.
ALTER TABLE "ngc"."Simulation" SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_analyze_scale_factor = 0.01,
  autovacuum_vacuum_cost_limit = 1000
);

-- SimulationPoll is only inserted into and deleted from, so it does not reach
-- the vacuum threshold either, and the same refresh reads it.
ALTER TABLE "ngc"."SimulationPoll" SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_vacuum_insert_scale_factor = 0.05
);

-- Superseded by Simulation_createdAt_id_idx for the counter query, and never
-- picked by the planner otherwise (121 scans against 52 MB): a bare index on
-- progression, the one column the simulator updates constantly, so it is
-- rewritten on nearly every write. Kept out of schema/ngc.prisma as well.
DROP INDEX "ngc"."Simulation_progression_idx";
