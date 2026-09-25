import { describe, expect, it } from 'vitest'

import { resolveLocale } from '../resolve-locale'

describe('resolveLocale', () => {
  it('passes a supported locale through', () => {
    expect(resolveLocale('fr')).toBe('fr')
    expect(resolveLocale('en')).toBe('en')
  })

  it('defaults a missing locale to fr', () => {
    expect(resolveLocale()).toBe('fr')
  })

  it('returns undefined for an unsupported locale', () => {
    expect(resolveLocale('de')).toBeUndefined()
  })
})
