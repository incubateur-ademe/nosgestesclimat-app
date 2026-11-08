import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type { NewRule, Rule } from '../types/rule.ts'
import { mapMetricToRow, mapRule, type RuleRow } from './rule.mapper.ts'

/**
 * Inserts the missing rules and refreshes the title and description of the
 * existing ones, in a single statement. Returns every given rule with its id.
 *
 * Safe to run concurrently with itself: rows are locked in a fixed
 * (name, metric) order, so two callers cannot deadlock, and the conflict
 * clause makes the second one update the rows the first one inserted.
 */
export const upsertRules = async (
  rules: NewRule[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<Rule[]> => {
  if (rules.length === 0) return []

  const sorted = rules.toSorted(
    (a, b) => compare(a.name, b.name) || compare(a.metric, b.metric)
  )

  // One array per column, cast via `text[]`: PGlite rejects an enum array
  // parameter.
  const rows = await session.$queryRaw<RuleRow[]>`
    INSERT INTO "ngc"."Rule" (name, metric, title, description)
    SELECT name, metric::"ngc"."Metric", title, description
    FROM unnest(
      ${sorted.map((rule) => rule.name)}::text[],
      ${sorted.map((rule) => mapMetricToRow(rule.metric))}::text[],
      ${sorted.map((rule) => rule.title)}::text[],
      ${sorted.map((rule) => rule.description)}::text[]
    ) AS input(name, metric, title, description)
    ON CONFLICT (name, metric) DO UPDATE
      SET title = EXCLUDED.title, description = EXCLUDED.description
    RETURNING id, name, metric
  `

  return rows.map(mapRule)
}

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)
