import type { Action as ActionEntity } from '@nosgestesclimat/core/features/actions/types/action'

export type Action = Pick<
  ActionEntity,
  | 'id'
  | 'title'
  | 'slug'
  | 'trackingId'
  | 'language'
  | 'longDescription'
  | 'theme'
  | 'ruleId'
  | 'media'
  | 'tips'
  | 'financialIncentives'
  | 'furtherExplore'
  | 'metadata'
  | 'publishedAt'
>
