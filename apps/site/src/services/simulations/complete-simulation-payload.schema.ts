import { ModelStringSchema } from '@nosgestesclimat/core/features/simulations/types/model'
import { ComputedResultsSchema } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import {
  FoldedStepsSchema,
  SituationSchema,
} from '@nosgestesclimat/core/features/simulations/validators/situation.schema'
import * as v from 'valibot'

export const CompleteSimulationPayloadSchema = v.strictObject({
  id: v.pipe(v.string(), v.uuid()),
  // The model the client ran the test with — migrated to the current version
  // when the client resumed an older simulation. Without it the completion
  // would judge computability from the persisted, possibly outdated model.
  model: ModelStringSchema,
  progression: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  situation: SituationSchema,
  foldedSteps: FoldedStepsSchema,
  computedResults: ComputedResultsSchema,
})

type _CompleteSimulationPayload = v.InferInput<
  typeof CompleteSimulationPayloadSchema
>

/** What the client sends: progression is runtime-known. Must equal 1 at
 * completion (core answers `simulation_incomplete`, not `invalid_payload`). */
export type CompleteSimulationPayload = Omit<
  _CompleteSimulationPayload,
  'progression'
> & { progression: number }
