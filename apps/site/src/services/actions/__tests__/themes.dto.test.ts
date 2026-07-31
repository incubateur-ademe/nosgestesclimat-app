import { themeFactory } from '@nosgestesclimat/core/features/actions/factories/theme.factory'
import { describe, expect, it } from 'vitest'
import { toThemeDto } from '../themes.dto'

describe('toThemeDto', () => {
  it('should transform theme entity to theme DTO', () => {
    const theme = themeFactory.build()
    const result = toThemeDto(theme)

    expect(result).toEqual({
      id: theme.id,
      key: theme.key,
      trackingId: theme.trackingId,
      title: theme.title,
      locale: theme.locale,
      emoji: theme.emoji,
    })
  })

  it('should handle theme with all required fields', () => {
    const theme = themeFactory.build()
    const result = toThemeDto(theme)

    expect(result.id).toBe(theme.id)
    expect(result.key).toBe(theme.key)
    expect(result.trackingId).toBe(theme.trackingId)
    expect(result.title).toBe(theme.title)
    expect(result.locale).toBe(theme.locale)
  })
})
