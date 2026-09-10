import { ComputedResultsSchema } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import {
  FoldedStepsSchema,
  SituationSchema,
} from '@nosgestesclimat/core/features/simulations/validators/situation.schema'
import * as v from 'valibot'

export const CompleteSimulationPayloadSchema = v.strictObject({
  id: v.pipe(v.string(), v.uuid()),
  progression: v.literal(1),
  situation: SituationSchema,
  foldedSteps: FoldedStepsSchema,
  computedResults: ComputedResultsSchema,
})

type _CompleteSimulationPayload = v.InferOutput<
  typeof CompleteSimulationPayloadSchema
>

/**
 * What the client actually sends: its progression is only known at runtime.
 * The action guards it explicitly so an unfinished simulation answers with a
 * `simulation_incomplete` failure instead of a generic `invalid_payload`.
 */
export type CompleteSimulationPayload = Omit<
  _CompleteSimulationPayload,
  'progression'
> & { progression: number }
