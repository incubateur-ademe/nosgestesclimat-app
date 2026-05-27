import * as v from 'valibot'

export const GeolocationFetchValidator = {
  body: v.optional(v.strictObject({})),
  params: v.optional(v.strictObject({})),
  query: v.optional(v.strictObject({})),
}
