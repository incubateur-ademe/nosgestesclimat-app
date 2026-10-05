import * as v from 'valibot'

export const AUTHORIZED_FROM_SEARCH_PARAMS_VALUES = {
  'action-plan': 'action-plan',
} as const

export type AuthorizedFromSearchParamsValues =
  keyof typeof AUTHORIZED_FROM_SEARCH_PARAMS_VALUES

export const AUTHORIZED_SEARCH_PARAMS_TO_BE_PRESERVED = {
  from: Object.keys(
    AUTHORIZED_FROM_SEARCH_PARAMS_VALUES
  ) as AuthorizedFromSearchParamsValues[],
}

export type AuthorizedSearchParamsToBePreserved =
  keyof typeof AUTHORIZED_SEARCH_PARAMS_TO_BE_PRESERVED

export const AuthorizedSearchParamsSchema = v.object({
  from: v.optional(v.picklist(AUTHORIZED_SEARCH_PARAMS_TO_BE_PRESERVED.from)),
})
