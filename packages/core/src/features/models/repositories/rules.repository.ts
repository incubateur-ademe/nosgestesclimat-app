import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type { NewRule, Rule } from '../types/rule.ts'
import { mapRule, type RuleRow } from './rule.mapper.ts'

/**
 * Safe to run concurrently with itself: rows are locked in a fixed
 * (name, metric) order, so two callers cannot deadlock, and the conflict
 * clause makes the second one update the rows the first one inserted.
 */
export const upsertRules = async (
  rules: NewRule[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<Rule[]> => {
  if (rules.length === 0) return []

  // A lock-acquisition order, not a display order: every caller feeds the rows
  // to the statement in the same fixed (name, metric) order.
  const sorted = rules.toSorted(
    (a, b) =>
      codeUnitCompare(a.name, b.name) || codeUnitCompare(a.metric, b.metric)
  )

  // A raw query because Prisma's typed API has no batch upsert that returns
  // ids: `upsert` is one row per statement, and `createMany` /
  // `createManyAndReturn({ skipDuplicates: true })` compiles to
  // `ON CONFLICT DO NOTHING`, which neither refreshes existing rows nor
  // returns their ids. Only `INSERT … ON CONFLICT DO UPDATE … RETURNING` does
  // all three in one round trip, which the caller needs to cache the id of
  // every rule of a model version.
  //
  // The batch travels as one array per column through `unnest` instead of a
  // `VALUES` list, so it stays a single prepared statement whatever the
  // number of rules. The arrays are cast via `text[]` because PGlite (the
  // test database) rejects an enum array parameter, so the metric travels as
  // text and is cast to "ngc"."Metric" in SQL. The same statement runs
  // unchanged on the real Postgres adapter in production.
  const rows = await session.$queryRaw<RuleRow[]>`
    INSERT INTO "ngc"."Rule" (name, metric, title, description)
    SELECT name, metric::"ngc"."Metric", title, description
    FROM unnest(
      ${sorted.map((rule) => rule.name)}::text[],
      ${sorted.map((rule) => rule.metric)}::text[],
      ${sorted.map((rule) => rule.title)}::text[],
      ${sorted.map((rule) => rule.description)}::text[]
    ) AS input(name, metric, title, description)
    ON CONFLICT (name, metric) DO UPDATE
      SET title = EXCLUDED.title, description = EXCLUDED.description
    RETURNING id, name, metric
  `

  return rows.map(mapRule)
}

// Not `localeCompare`, which depends on the process locale: every process must
// lock the rows in the same order.
const codeUnitCompare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)
