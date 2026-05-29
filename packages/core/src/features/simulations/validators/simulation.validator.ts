import * as v from 'valibot'

const MODEL_REGEX = /^[A-Z]+-[a-z]+-\d+\.\d+\.\d+$/

const CategoriesSchema = v.strictObject({
  alimentation: v.number(),
  transport: v.number(),
  logement: v.number(),
  divers: v.number(),
  'services sociétaux': v.number(),
})

const MetricComputedResultSchema = v.strictObject({
  bilan: v.number(),
  categories: CategoriesSchema,
  subcategories: v.optional(v.record(v.string(), v.number())),
})

const ComputedResultSchema = v.strictObject({
  carbone: MetricComputedResultSchema,
  eau: MetricComputedResultSchema,
})

export type ComputedResultSchema = v.InferOutput<typeof ComputedResultSchema>

const ActionChoicesSchema = v.record(v.string(), v.boolean())

const FoldedStepsSchema = v.array(v.string())

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

const ExtendedSituationNodeValue = v.nullable(
  v.union([SituationNodeValue, v.boolean()])
)

export const SituationSchema = v.record(v.string(), SituationNodeValue)

export type SituationSchema = v.InferOutput<typeof SituationSchema>

const ExtendedSituationSchema = v.record(
  v.string(),
  v.union([
    v.strictObject({
      source: v.literal('omitted'),
    }),
    v.object({
      source: v.union([v.literal('answered'), v.literal('default')]),
      nodeValue: ExtendedSituationNodeValue,
    }),
  ])
)

export const NewSimulationDto = v.object({
  id: v.pipe(v.string(), v.uuid()),
  date: v.optional(
    v.pipe(
      v.unknown(),
      v.transform((v) => new Date(v as string | number | Date)),
      v.date()
    ),
    () => new Date()
  ),
  model: v.optional(v.pipe(v.string(), v.regex(MODEL_REGEX))),
  progression: v.number(),
  computedResults: ComputedResultSchema,
  actionChoices: v.optional(ActionChoicesSchema, {}),
  foldedSteps: v.optional(FoldedStepsSchema, []),
  situation: SituationSchema,
  extendedSituation: v.optional(ExtendedSituationSchema),
})

export type NewSimulationDto = v.InferOutput<typeof NewSimulationDto>

export type NewSimulationInputDto = v.InferInput<typeof NewSimulationDto>
