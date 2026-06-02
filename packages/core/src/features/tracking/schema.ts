import * as v from 'valibot'

export const trackingIdSchema = v.pipe(
  v.string(),
  v.regex(/^[a-z0-9]+(_[a-z0-9]+)*$/, 'Invalid tracking id format')
)
