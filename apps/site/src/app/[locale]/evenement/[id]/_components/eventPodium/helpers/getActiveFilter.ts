import * as v from 'valibot'
import { FILTER_KEY, FILTER_VALUES, type FilterValue } from '../EventTabs'

const filterParamSchema = v.fallback(
  v.pipe(v.string(), v.picklist(FILTER_VALUES)),
  'all' as const
)

export function getActiveFilter(
  params: Record<string, string | string[] | undefined>
): FilterValue {
  return v.parse(filterParamSchema, params[FILTER_KEY])
}
