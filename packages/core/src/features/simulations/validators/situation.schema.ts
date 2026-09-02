import * as v from 'valibot'

export const FoldedStepsSchema = v.array(v.string())

export type FoldedSteps = v.InferOutput<typeof FoldedStepsSchema>

const SituationNodeValueSchema = v.union([
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

export const SituationSchema = v.record(v.string(), SituationNodeValueSchema)

export type Situation = v.InferOutput<typeof SituationSchema>
