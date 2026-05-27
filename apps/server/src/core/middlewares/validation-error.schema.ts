import * as v from 'valibot'

export const ValidationErrorSchema = v.object({
  name: v.literal('ZodError'),
  issues: v.array(v.any()),
})
