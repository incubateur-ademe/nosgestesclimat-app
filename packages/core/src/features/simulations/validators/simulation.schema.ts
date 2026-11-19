import * as v from 'valibot'

export const SimulationStatusSchema = v.picklist([
  'not_started',
  'answering_major_questions',
  'major_questions_result_seen',
  'answering_minor_questions',
  'full_result_seen',
])
