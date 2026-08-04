import { describe, expect, it } from 'vitest'
import type { Model, ModelRegion } from '../../../simulations/types/model.ts'
import { isModelSupported } from '../is-model-supported.ts'
import {
  CURRENT_MODEL_VERSION,
  PREVIOUS_MODEL_VERSION,
} from '../model-versions.ts'

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

  it('accepts the previous version', () => {
    expect(
      isModelSupported({
        ...baseModel,
        version: { publishedTag: PREVIOUS_MODEL_VERSION },
      })
    ).toBe(true)
  })

  it('rejects an unknown region', () => {
    expect(
      isModelSupported({ ...baseModel, region: 'ZZ' as ModelRegion })
    ).toBe(false)
  })

  it('rejects an arbitrary older version', () => {
    expect(
      isModelSupported({ ...baseModel, version: { publishedTag: '0.0.1' } })
    ).toBe(false)
  })
})
