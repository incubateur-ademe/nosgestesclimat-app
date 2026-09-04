import { ComputedResultsSchema } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import {
  ModelSchema,
  ProgressionSchema,
} from '@nosgestesclimat/core/features/simulations/validators/simulation.schema'
import {
  FoldedStepsSchema,
  SituationSchema,
} from '@nosgestesclimat/core/features/simulations/validators/situation.schema'
import * as v from 'valibot'

export const UpdateSimulationSituationPayloadSchema = v.strictObject({
  id: v.pipe(v.string(), v.uuid()),
  model: v.optional(ModelSchema),
  situation: SituationSchema,
  foldedSteps: FoldedStepsSchema,
  progression: ProgressionSchema,
  computedResults: ComputedResultsSchema,
})

export type UpdateSimulationSituationPayload = v.InferOutput<
  typeof UpdateSimulationSituationPayloadSchema
>
