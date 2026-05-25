import type { Theme } from '@/types/themes'
import type { Theme as ThemeEntity } from '@nosgestesclimat/core/features/actions/types/theme'

export function toThemeDto(theme: ThemeEntity): Theme {
  const { id, key, trackingId, title, language, emoji } = theme
  return {
    id,
    key,
    trackingId,
    title,
    language,
    emoji,
  }
}
