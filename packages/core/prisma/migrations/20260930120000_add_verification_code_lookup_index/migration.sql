-- Login and newsletter confirmation look up a verification code by
-- (email, usage, expirationDate) on every attempt, and no index serves that
-- predicate: each attempt sequentially scans the table, whose rows are never
-- deleted (expiry only sets expirationDate in the past), so the scan cost
-- grows without bound with traffic.
--
-- CONCURRENTLY as in 20260918111000: the table is written on every code
-- issuance, and a plain CREATE INDEX would take a SHARE lock blocking those
-- inserts for the whole build.
CREATE INDEX CONCURRENTLY "VerificationCode_email_usage_expirationDate_idx"
  ON "ngc"."VerificationCode" ("email", "usage", "expirationDate");
