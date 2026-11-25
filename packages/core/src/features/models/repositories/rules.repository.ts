import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type { Metric, ModelRule, Rule } from '../types/rule.ts'
import { mapRule, type RuleRow } from './rule.mapper.ts'

/** Finds a unique rule by its name and metric, the default one when none. */
export const findRule = async (
  name: string,
  {
    metric = null,
    session = prisma,
  }: { metric?: Metric | null; session?: Transaction } = {}
): Promise<Rule | null> => {
  const row = await session.rule.findUnique({
    where: {
      name_appliesToWaterMetric: {
        name,
        appliesToWaterMetric: metric === 'water',
      },
    },
    select: { id: true, name: true, appliesToWaterMetric: true },
  })
  return row ? mapRule(row) : null
}

/**
 * Stores each rule as its row, each identified by its name and water mark: a
 * stored rule is never renamed, so those are the conflict key; the wording is
 * refreshed on conflict.
 *
 * Safe to run concurrently with itself: rows are locked in a fixed name and
 * water mark order, so two callers cannot deadlock, and the conflict clause
 * makes the second one update the rows the first one inserted.
 */
export const upsertRules = async (
  rules: ModelRule[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<Rule[]> => {
  if (rules.length === 0) return []

  const rows = rules

  // A lock-acquisition order, not a display order: every caller feeds the rows
  // to the statement in the same fixed order.
  const sorted = rows.toSorted((a, b) =>
    a.name === b.name
      ? Number(a.appliesToWaterMetric) - Number(b.appliesToWaterMetric)
      : codeUnitCompare(a.name, b.name)
  )

  // A raw query because Prisma's typed API has no batch upsert that returns
  // ids: `upsert` is one row per statement, and `createMany` /
  // `createManyAndReturn({ skipDuplicates: true })` compiles to
  // `ON CONFLICT DO NOTHING`, which neither refreshes existing rows nor
  // returns their ids. Only `INSERT … ON CONFLICT DO UPDATE … RETURNING` does
  // all three in one round trip, which the caller needs to cache the id of
  // every rule row of a model version.
  //
  // The batch travels as one array per column through `unnest` instead of a
  // `VALUES` list, so it stays a single prepared statement whatever the
  // number of rules.
  const stored = await session.$queryRaw<RuleRow[]>`
    INSERT INTO "ngc"."Rule" (name, "appliesToWaterMetric", title, description)
    SELECT name, "appliesToWaterMetric", title, description
    FROM unnest(
      ${sorted.map((rule) => rule.name)}::text[],
      ${sorted.map((rule) => rule.appliesToWaterMetric)}::boolean[],
      ${sorted.map((rule) => rule.title)}::text[],
      ${sorted.map((rule) => rule.description)}::text[]
    ) AS input(name, "appliesToWaterMetric", title, description)
    ON CONFLICT (name, "appliesToWaterMetric") DO UPDATE
      SET title = EXCLUDED.title,
          description = EXCLUDED.description
    RETURNING id, name, "appliesToWaterMetric"
  `

  return stored.map(mapRule)
}

// Not `localeCompare`, which depends on the process locale: every process must
// lock the rows in the same order.
const codeUnitCompare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)
