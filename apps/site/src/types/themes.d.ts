import type { Theme as ThemeEntity } from '@nosgestesclimat/core/features/actions/types/theme'

export type Theme = Pick<
  ThemeEntity,
  'id' | 'key' | 'trackingId' | 'title' | 'language' | 'emoji'
>
