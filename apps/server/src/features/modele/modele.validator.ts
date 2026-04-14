import { z } from 'zod'

export const GeolocationFetchValidator = {
  body: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
  query: z.object({}).strict().optional(),
}
