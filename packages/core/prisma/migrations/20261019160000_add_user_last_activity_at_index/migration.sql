-- Each sweep selects the candidates on "lastActivityAt", which no index serves:
-- without one, the two queries sequentially scan ngc."User".
--
-- CONCURRENTLY as in 20260918111000: login upserts the table, and a plain build
-- would block those writes for the whole scan.
CREATE INDEX CONCURRENTLY "User_lastActivityAt_idx"
  ON "ngc"."User" ("lastActivityAt");
