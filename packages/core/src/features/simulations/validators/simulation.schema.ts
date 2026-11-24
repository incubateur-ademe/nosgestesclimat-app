import * as v from 'valibot'

export const SimulationStatusSchema = v.picklist([
  'not_started',
  'answering_major_questions',
  'full_result_seen',
])
