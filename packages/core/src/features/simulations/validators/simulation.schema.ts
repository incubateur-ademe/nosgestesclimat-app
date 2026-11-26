import * as v from 'valibot'

export const ProgressionSchema = v.pipe(
  v.number(),
  v.minValue(0),
  v.maxValue(1)
)

export const SimulationStatusSchema = v.picklist([
  'not_started',
  'answering_major_questions',
  'major_questions_result_seen',
  'answering_minor_questions',
  'full_result_seen',
])
