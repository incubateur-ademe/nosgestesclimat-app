import type { SearchParams } from 'next/dist/server/request/search-params'
import * as v from 'valibot'
import { AuthorizedSearchParamsSchema } from '../_constants/search-params'

export function validateSearchParams(
  searchParams: SearchParams | undefined
): v.InferOutput<typeof AuthorizedSearchParamsSchema> | null {
  const { success, output } = v.safeParse(
    AuthorizedSearchParamsSchema,
    searchParams
  )

  return success ? output : null
}
