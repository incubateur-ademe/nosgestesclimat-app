/**
 * Ported from the legacy server (apps/server/src/features/simulations/simulations.validator.ts).
 * Does not meet core quality standards and will be replaced by an
 * engine-based evaluation in Phase 2.
 */
import * as v from 'valibot'

const SituationNodeValue = v.union([
  v.string(),
  v.number(),
  v.strictObject({
    valeur: v.union([
      v.pipe(v.unknown(), v.transform(Number), v.number()),
      v.pipe(
        v.string(),
        v.transform((s) => +s.replace(/\s/g, '')),
        v.number()
      ),
    ]),
    unité: v.optional(v.string()),
  }),
  v.strictObject({
    type: v.literal('number'),
    fullPrecision: v.boolean(),
    nodeValue: v.number(),
    nodeKind: v.literal('constant'),
    rawNode: v.number(),
    isNullable: v.optional(v.boolean()),
    missingVariables: v.optional(v.object({})),
  }),
  v.strictObject({
    explanation: v.strictObject({
      type: v.literal('number'),
      fullPrecision: v.boolean(),
      nodeValue: v.number(),
      nodeKind: v.literal('constant'),
      rawNode: v.strictObject({
        constant: v.strictObject({
          type: v.union([v.literal('constant'), v.literal('number')]),
          nodeValue: v.number(),
        }),
      }),
      isNullable: v.optional(v.boolean()),
      missingVariables: v.optional(v.object({})),
    }),
    unit: v.strictObject({
      numerators: v.string(),
      denominators: v.optional(v.string()),
    }),
    nodeKind: v.literal('unité'),
    rawNode: v.string(),
  }),
])

export const SituationSchema = v.record(v.string(), SituationNodeValue)

export type SituationSchema = v.InferOutput<typeof SituationSchema>
