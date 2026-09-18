-- Finished simulations participating in this poll, written by the stats
-- recomputation with the other aggregates.
ALTER TABLE "ngc"."Poll" ADD COLUMN "participantsCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill so the count is right before the first recomputation writes it.
UPDATE "ngc"."Poll" AS p
SET "participantsCount" = counted.count
FROM (
  SELECT sp."pollId", COUNT(*)::INTEGER AS count
  FROM "ngc"."SimulationPoll" AS sp
  INNER JOIN "ngc"."Simulation" AS s ON s."id" = sp."simulationId"
  WHERE s."progression" = 1
  GROUP BY sp."pollId"
) AS counted
WHERE counted."pollId" = p."id";
