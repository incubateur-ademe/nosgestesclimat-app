import { describe, expect, it } from 'vitest'
import { formatLocalizedDate } from '../format-localized-date.ts'

describe('formatLocalizedDate', () => {
  // 18 September 2026, midnight Europe/Paris.
  const date = '2026-09-17T22:00:00Z'

  it('formats a long date in French', () => {
    expect(
      formatLocalizedDate(date, 'fr', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    ).toBe('18 septembre 2026')
  })

  it('formats a long date in English', () => {
    expect(
      formatLocalizedDate(date, 'en', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    ).toBe('18 September 2026')
  })
})
