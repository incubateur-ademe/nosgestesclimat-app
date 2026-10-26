import { describe, expect, it } from 'vitest'
import { getModelFileName } from '../get-model-file-name.ts'

describe('getModelFileName', () => {
  it('suffixes the FR file with -opti when the optimized set is asked for', () => {
    expect(
      getModelFileName({ region: 'FR', locale: 'fr', isOptim: true })
    ).toBe('co2-model.FR-lang.fr-opti.json')
  })

  it('returns the full FR file otherwise', () => {
    expect(
      getModelFileName({ region: 'FR', locale: 'fr', isOptim: false })
    ).toBe('co2-model.FR-lang.fr.json')
  })

  it('honours the locale', () => {
    expect(
      getModelFileName({ region: 'FR', locale: 'en', isOptim: true })
    ).toBe('co2-model.FR-lang.en-opti.json')
  })

  it('never suffixes a non-FR region, which has no optimized build', () => {
    expect(
      getModelFileName({ region: 'UK', locale: 'fr', isOptim: true })
    ).toBe('co2-model.UK-lang.fr.json')
    expect(
      getModelFileName({ region: 'ED', locale: 'en', isOptim: false })
    ).toBe('co2-model.ED-lang.en.json')
  })
})
