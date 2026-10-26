import { describe, expect, it } from 'vitest'
import { CURRENT_MODEL_VERSION } from '../../../models/helpers/model-versions.ts'
import type { Model, ModelRegion } from '../../../models/types/model.ts'
import { isModelSupported } from '../is-model-supported.ts'

const baseModel: Model = {
  region: 'FR',
  locale: 'fr',
  version: { publishedTag: CURRENT_MODEL_VERSION },
}

describe('isModelSupported', () => {
  it('accepts FR/fr on the current version', () => {
    expect(isModelSupported(baseModel)).toBe(true)
  })

  it('accepts any known region', () => {
    expect(isModelSupported({ ...baseModel, region: 'UK' })).toBe(true)
  })

  it('accepts the en locale', () => {
    expect(isModelSupported({ ...baseModel, locale: 'en' })).toBe(true)
  })

  it('accepts an arbitrary older version, retrieved on demand', () => {
    expect(
      isModelSupported({ ...baseModel, version: { publishedTag: '0.0.1' } })
    ).toBe(true)
  })

  it('accepts a PR version, retrieved on demand', () => {
    expect(
      isModelSupported({ ...baseModel, version: { PRNumber: '42' } })
    ).toBe(true)
  })

  it('rejects an unknown region', () => {
    expect(
      isModelSupported({ ...baseModel, region: 'ZZ' as ModelRegion })
    ).toBe(false)
  })
})
