-- PostHog warehouse syncs cursor on "updatedAt", through ngc_anon."Simulation",
-- and no index serves that predicate: every run sequentially scans the table to
-- collect the ~2 400 rows touched in the last 6 hours.
--
-- Indexing a column that changes on every write removes the remaining HOT
-- updates. That is deliberate: fillfactor = 100 leaves no room on the page for
-- the new version anyway, so ~87 % of the updates already move to another page
-- and HOT is down to a few percent.
--
-- CONCURRENTLY as in 20260918111000: a plain build would block the autosaves for
-- the whole scan.
CREATE INDEX CONCURRENTLY "Simulation_updatedAt_idx"
  ON "ngc"."Simulation" ("updatedAt");
