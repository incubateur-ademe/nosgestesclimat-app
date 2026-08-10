import { describe, expect, it } from 'vitest'
import { formatEventDate } from '../formatEventDate.ts'

describe('formatEventDate', () => {
  // 18 September 2026, midnight Europe/Paris.
  const date = '2026-09-17T22:00:00Z'

  it('formats a long date in French', () => {
    expect(
      formatEventDate(date, 'fr', 'Europe/Paris', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    ).toBe('18 septembre 2026')
  })

  it('formats a long date in English (day-first)', () => {
    expect(
      formatEventDate(date, 'en', 'Europe/Paris', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    ).toBe('18 September 2026')
  })

  it('accepts a Date and a custom timezone', () => {
    expect(
      formatEventDate(new Date(date), 'en', 'America/New_York', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    ).toBe('17 September 2026')
  })
})
