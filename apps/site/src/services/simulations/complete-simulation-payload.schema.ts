import { ComputedResultsSchema } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import {
  FoldedStepsSchema,
  SituationSchema,
} from '@nosgestesclimat/core/features/simulations/validators/situation.schema'
import * as v from 'valibot'

export const CompleteSimulationPayloadSchema = v.strictObject({
  id: v.pipe(v.string(), v.uuid()),
  situation: SituationSchema,
  foldedSteps: FoldedStepsSchema,
  computedResults: ComputedResultsSchema,
})

export type CompleteSimulationPayload = v.InferOutput<
  typeof CompleteSimulationPayloadSchema
>
