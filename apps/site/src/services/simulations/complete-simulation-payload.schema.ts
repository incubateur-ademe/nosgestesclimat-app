import { ModelStringSchema } from '@nosgestesclimat/core/features/models/types/model'
import { ComputedResultsSchema } from '@nosgestesclimat/core/features/simulations/validators/computed-results.schema'
import { SimulationStatusSchema } from '@nosgestesclimat/core/features/simulations/validators/simulation.schema'
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
  status: SimulationStatusSchema,
  situation: SituationSchema,
  foldedSteps: FoldedStepsSchema,
  computedResults: ComputedResultsSchema,
})

/** Core answers `simulation_incomplete` when the status is not a completed one. */
export type CompleteSimulationPayload = v.InferInput<
  typeof CompleteSimulationPayloadSchema
>
