import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type { Metric, NewRule, Rule } from '../types/rule.ts'
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
    select: { id: true, name: true, public: true, appliesToWaterMetric: true },
  })
  return row ? mapRule(row) : null
}

/**
 * Upserts each rule by (name, appliesToWaterMetric) — a stored rule is never
 * renamed — refreshing wording and `public` on conflict.
 */
export const upsertRules = async (
  rules: NewRule[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<Rule[]> => {
  if (rules.length === 0) return []

  const rows = rules

  // Fixed lock-acquisition order: concurrent callers feed the rows to the
  // statement in the same order, so they cannot deadlock.
  const sorted = rows.toSorted((a, b) =>
    a.name === b.name
      ? Number(a.appliesToWaterMetric) - Number(b.appliesToWaterMetric)
      : codeUnitCompare(a.name, b.name)
  )

  // Raw query: Prisma has no batch upsert returning ids (`createMany` compiles to
  // ON CONFLICT DO NOTHING); INSERT … ON CONFLICT DO UPDATE … RETURNING does both
  // in one round trip. One array per column via `unnest` keeps a single prepared
  // statement whatever the number of rules.
  const stored = await session.$queryRaw<RuleRow[]>`
    INSERT INTO "ngc"."Rule" (name, "public", "appliesToWaterMetric", title, description)
    SELECT name, "public", "appliesToWaterMetric", title, description
    FROM unnest(
      ${sorted.map((rule) => rule.name)}::text[],
      ${sorted.map((rule) => rule.public)}::boolean[],
      ${sorted.map((rule) => rule.appliesToWaterMetric)}::boolean[],
      ${sorted.map((rule) => rule.title)}::text[],
      ${sorted.map((rule) => rule.description)}::text[]
    ) AS input(name, "public", "appliesToWaterMetric", title, description)
    ON CONFLICT (name, "appliesToWaterMetric") DO UPDATE
      SET "public" = EXCLUDED."public",
          title = EXCLUDED.title,
          description = EXCLUDED.description
    RETURNING id, name, "public", "appliesToWaterMetric"
  `

  return stored.map(mapRule)
}

// Not `localeCompare` (locale-dependent): every process must lock rows in the same order.
const codeUnitCompare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)
